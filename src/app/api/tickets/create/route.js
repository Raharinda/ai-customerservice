import { adminDb } from '@/lib/firebaseAdmin';
import { adminAuth } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * Trigger AI analysis asynchronously (fire and forget)
 */
async function triggerAIAnalysis(ticketId) {
  try {
    console.log(`🚀 Triggering AI analysis for ticket: ${ticketId}`);
    
    // Call AI worker endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai/analyze-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI analysis failed');
    }

    console.log(`✅ AI analysis triggered for ticket: ${ticketId}`);
  } catch (error) {
    console.error(`❌ Error triggering AI analysis:`, error);
    throw error;
  }
}

/**
 * POST /api/tickets/create
 * Create new ticket - UNIFIED SYSTEM (replaces old request system)
 * 
 * Optimizations:
 * - Denormalized customer data for fast reads
 * - Counter fields (messageCount) to avoid subcollection counting
 * - lastMessageAt for efficient sorting
 * - Supports both authenticated and anonymous users
 * - AI analysis triggered automatically for new tickets
 */
export async function POST(request) {
  try {
    console.log('📝 POST /api/tickets/create - Unified ticket system');

    // Parse request body
    const body = await request.json();
    const { 
      subject, 
      message,
      description, // Alias for message (backward compatibility)
      category,
      priority = 'medium',
      customerId,
      customerEmail,
      customerName,
      idToken // Optional - for authenticated users
    } = body;

    const messageContent = message || description;

    // === VALIDATION ===
    if (!subject || !messageContent || !category) {
      return NextResponse.json(
        { error: 'Subject, message, and category are required' },
        { status: 400 }
      );
    }

    if (subject.trim().length < 5) {
      return NextResponse.json(
        { error: 'Subject must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (messageContent.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'Technical Issue', 
      'Billing & Payment', 
      'Feature Request', 
      'Account Access', 
      'Other'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Priority must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // === AUTHENTICATION (Optional) ===
    let userId = customerId || 'anonymous';
    let userEmail = customerEmail || 'anonymous@example.com';
    let userName = customerName || 'Anonymous User';

    if (idToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        userId = decodedToken.uid;
        userEmail = decodedToken.email || userEmail;
        userName = decodedToken.name || decodedToken.email || userName;
      } catch (authError) {
        console.warn('⚠️ Token verification failed, using anonymous:', authError.message);
      }
    }

    console.log('Creating ticket:', { subject, category, priority, userId });

    // === CREATE TICKET (Optimized Structure) ===
    const now = new Date().toISOString();
    
    const ticketData = {
      // Core fields
      subject: subject.trim(),
      description: messageContent.trim(),
      category,
      priority,
      status: 'open',
      
      // Customer info (denormalized for fast reads)
      customerId: userId,
      customerEmail: userEmail,
      customerName: userName,
      
      // Assignment
      assignedTo: null,
      
      // Timestamps (for sorting and tracking)
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now, // Will be updated when new messages arrive
      
      // Counters (to avoid counting subcollection)
      messageCount: 1, // Initial message counts as 1
      unreadCount: 1, // For agent - new ticket is unread
      
      // ✅ AI Analysis Status - DEFAULT: pending untuk ticket baru
      aiAnalysis: {
        status: 'pending', // pending | processing | done | error
        processedAt: null,
        error: null,
        // Hasil AI akan diisi oleh worker nanti:
        // sentiment, category, urgency, suggestedResponse
      },
      
      // Optional fields
      tags: [], // For future categorization
      metadata: {
        source: idToken ? 'authenticated' : 'anonymous',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    const ticketRef = await adminDb.collection('tickets').add(ticketData);
    const ticketId = ticketRef.id;

    console.log(`✅ Ticket created with ID: ${ticketId}, AI status: pending`);

    // === CREATE INITIAL MESSAGE (Optimized) ===
    const initialMessageData = {
      // Sender info (denormalized)
      senderId: userId,
      senderName: userName,
      senderEmail: userEmail,
      senderRole: 'customer',
      
      // Message content
      message: messageContent.trim(),
      
      // Metadata
      createdAt: now,
      read: false,
      
      // Optional
      attachments: [], // For future file uploads
      edited: false,
      editedAt: null
    };

    await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(initialMessageData);

    console.log('✅ Initial message added to ticket');

    // === TRIGGER AI WORKER (Async - Fire and Forget) ===
    // Jalankan AI analysis di background tanpa tunggu response
    triggerAIAnalysis(ticketId).catch(err => {
      console.error('❌ Failed to trigger AI analysis:', err);
      // Error di-catch tapi tidak block response ke client
    });

    // === RESPONSE ===
    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticketId,
        ticket: {
          id: ticketId,
          ...ticketData,
        },
      },
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
