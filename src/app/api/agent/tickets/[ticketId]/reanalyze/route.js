import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/agent/tickets/[ticketId]/reanalyze
 * Request re-analysis of ticket by AI with FULL CONVERSATION CONTEXT
 * 
 * Flow:
 * 1. Get ticket data
 * 2. Get ALL messages in conversation (from subcollection)
 * 3. Set aiAnalysis.reprocessRequested = true
 * 4. Set aiAnalysis.status = 'pending'
 * 5. Trigger AI worker with conversation context
 * 6. Worker will analyze full conversation and overwrite results
 */
export async function POST(request, { params }) {
  try {
    // ✅ FIX: Await params (Next.js 15+ requirement)
    const { ticketId } = await params;
    
    console.log(`🔄 Re-analyze request for ticket: ${ticketId}`);

    // === STEP 1: Get ticket data ===
    const ticketRef = adminDb.collection('tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();
    console.log(`📋 Ticket found: ${ticketData.subject}`);

    // === STEP 2: Get ALL messages in conversation ===
    const messagesSnapshot = await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data(),
    }));

    console.log(`💬 Retrieved ${messages.length} messages from conversation`);

    // Build conversation context
    const conversationContext = messages.map((msg, index) => {
      const role = msg.senderRole === 'customer' ? 'Customer' : 'Agent';
      return `${index + 1}. [${role}]: ${msg.message}`;
    }).join('\n');

    console.log(`📝 Conversation context prepared (${conversationContext.length} chars)`);

    // === STEP 3: Set reprocess flag and reset status ===
    const now = new Date().toISOString();
    
    await ticketRef.update({
      'aiAnalysis.reprocessRequested': true,
      'aiAnalysis.status': 'pending', // Reset to pending to trigger worker
      'aiAnalysis.reprocessRequestedAt': now,
      'aiAnalysis.conversationLength': messages.length, // Track conversation size
      updatedAt: now,
    });

    console.log(`✅ Ticket ${ticketId} marked for re-analysis with ${messages.length} messages`);

    // === STEP 4: Trigger AI worker ===
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai/analyze-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ticketId,
        // Pass conversation context to worker
        conversationContext: conversationContext,
        isReanalysis: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to trigger AI worker');
    }

    console.log(`🚀 AI worker triggered successfully for re-analysis`);

    return NextResponse.json({
      success: true,
      message: 'Re-analysis triggered successfully',
      data: {
        ticketId,
        status: 'pending',
        reprocessRequested: true,
        messageCount: messages.length,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in reanalyze endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
