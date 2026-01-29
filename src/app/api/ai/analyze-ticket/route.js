import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { 
  generateAnalysisPrompt,
  generateAnalysisPromptWithConversation, 
  parseGeminiResponse, 
  mapUrgencyLevel, 
  mapMoodToSentiment 
} from '@/lib/geminiPrompt';
import { analyzeTicketWithGemini } from '@/lib/geminiAPI';

/**
 * POST /api/ai/analyze-ticket
 * AI Worker endpoint - Analyze ticket with Gemini
 * 
 * Flow:
 * 1. Worker ambil data ticket dari Firestore
 * 2. Update status: pending -> processing
 * 3. Worker kirim data ke Gemini API
 * 4. Parse & validate response dari Gemini
 * 5. Update status: processing -> done/error
 * 6. Save AI results ke ticket
 */
export async function POST(request) {
  try {
    const { ticketId, conversationContext, isReanalysis } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 AI Worker: Starting analysis for ticket ${ticketId}`);
    if (isReanalysis && conversationContext) {
      console.log(`🔄 RE-ANALYSIS mode with FULL CONVERSATION`);
    }

    // === STEP 1: Worker ambil data ticket dari Firestore ===
    const ticketRef = adminDb.collection('tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      console.error(`❌ Ticket ${ticketId} not found`);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();
    console.log(`✅ Worker retrieved ticket data:`, {
      ticketId,
      subject: ticketData.subject,
      category: ticketData.category,
      description: ticketData.description?.substring(0, 50) + '...',
      aiAnalysisStatus: ticketData.aiAnalysis?.status,
    });

    // ✅ UPDATED: Cek apakah sudah diproses (kecuali jika reprocess diminta)
    if (ticketData.aiAnalysis?.status === 'done' && ticketData.aiAnalysis?.reprocessRequested !== true) {
      console.log(`⚠️ Ticket ${ticketId} already analyzed and no reprocess requested, skipping`);
      return NextResponse.json({
        success: true,
        message: 'Ticket already analyzed',
        data: { ticketId, status: 'done' }
      });
    }

    if (ticketData.aiAnalysis?.status === 'processing') {
      console.log(`⚠️ Ticket ${ticketId} already being processed`);
      return NextResponse.json({
        success: true,
        message: 'Ticket already being processed',
        data: { ticketId, status: 'processing' }
      });
    }

    // ✅ CHECK: Apakah ini re-analyze request?
    const isReprocess = ticketData.aiAnalysis?.reprocessRequested === true;
    
    if (isReprocess) {
      console.log(`🔄 RE-ANALYZE requested for ticket ${ticketId}`);
      console.log(`   Previous analysis: mood=${ticketData.aiAnalysis.mood}, urgency=${ticketData.aiAnalysis.urgency}`);
    } else {
      console.log(`🆕 First-time analysis for ticket ${ticketId}`);
    }

    const now = new Date().toISOString();

    // === STEP 2: Update status to PROCESSING ===
    await ticketRef.update({
      'aiAnalysis.status': 'processing',
      'aiAnalysis.startedAt': now,
      updatedAt: now,
    });

    console.log(`⏳ AI Analysis: Status updated to PROCESSING`);

    try {
      // === STEP 3: Worker kirim data ke Gemini API ===
      console.log(`📤 Worker preparing to send data to Gemini...`);
      
      let prompt;
      let dataForGemini;

      // ✅ NEW: Check if we have conversation context (re-analysis)
      if (conversationContext && isReanalysis) {
        console.log(`💬 Using FULL CONVERSATION context for re-analysis`);
        prompt = generateAnalysisPromptWithConversation(
          ticketData.subject,
          conversationContext
        );
        dataForGemini = {
          ticketId,
          subject: ticketData.subject,
          conversationContext: conversationContext,
          category: ticketData.category,
          isReanalysis: true,
        };
      } else {
        // First-time analysis: use initial message only
        console.log(`📝 Using initial message for first-time analysis`);
        
        // Ambil message pertama (initial message) dari subcollection
        const messagesSnapshot = await adminDb
          .collection('tickets')
          .doc(ticketId)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .limit(1)
          .get();

        let initialMessage = ticketData.description;
        if (!messagesSnapshot.empty) {
          initialMessage = messagesSnapshot.docs[0].data().message;
        }

        // Siapkan data untuk dikirim ke Gemini
        dataForGemini = {
          ticketId,
          subject: ticketData.subject,
          description: initialMessage,
          category: ticketData.category,
          customerName: ticketData.customerName,
          createdAt: ticketData.createdAt,
        };

        prompt = generateAnalysisPrompt(dataForGemini);
      }

      console.log(`📦 Data prepared for Gemini:`, {
        ticketId: dataForGemini.ticketId,
        subject: dataForGemini.subject,
        isReanalysis: dataForGemini.isReanalysis || false,
        hasConversationContext: !!conversationContext,
      });

      // === Call Gemini API (REAL IMPLEMENTATION) ===
      console.log(`🔮 Calling Gemini API with model: gemini-2.5-flash...`);
      console.log(`📤 Prompt type: ${conversationContext && isReanalysis ? 'CONVERSATION-BASED' : 'INITIAL MESSAGE'}`);
      const geminiResponse = await analyzeTicketWithGemini(dataForGemini, prompt);
      console.log(`✅ Gemini API response received`);
      console.log(`📋 Raw Gemini Output:`, geminiResponse);

      // === STEP 4: Parse & validate response ===
      const aiResults = validateGeminiResponse(geminiResponse);
      console.log(`✅ Parsed JSON - 4 Required Outputs:`, {
        '1. mood': aiResults.mood,
        '2. urgency_score': aiResults.urgencyScore,
        '3. summary': aiResults.summary.substring(0, 50) + '...',
        '4. suggested_reply': aiResults.suggestedResponse.substring(0, 50) + '...'
      });

      // === STEP 5: Update status to DONE + Save results ===
      console.log(`💾 Saving AI results to Firebase...`);
      
      const aiAnalysisData = {
        'aiAnalysis.status': 'done',
        'aiAnalysis.processedAt': now,
        'aiAnalysis.mood': aiResults.mood,
        'aiAnalysis.sentiment': aiResults.sentiment,
        'aiAnalysis.urgency': aiResults.urgency,
        'aiAnalysis.urgencyScore': aiResults.urgencyScore,
        'aiAnalysis.summary': aiResults.summary,
        'aiAnalysis.suggestedResponse': aiResults.suggestedResponse,
        'aiAnalysis.suggestedCategory': aiResults.category,
        'aiAnalysis.error': null,
        'aiAnalysis.reprocessRequested': false, // ✅ Clear reprocess flag
        'aiAnalysis.reprocessCount': (ticketData.aiAnalysis?.reprocessCount || 0) + (isReprocess ? 1 : 0), // ✅ Track reprocess count
        'aiAnalysis.lastProcessedAt': now, // ✅ Track last processing time
        updatedAt: now,
      };

      await ticketRef.update(aiAnalysisData);

      console.log(`✅ AI results saved to Firebase successfully!`);
      console.log(`📊 Saved data:`, {
        status: 'done',
        mood: aiResults.mood,
        sentiment: aiResults.sentiment,
        urgency: aiResults.urgency,
        urgencyScore: aiResults.urgencyScore,
        summary: aiResults.summary,
        suggestedResponse: aiResults.suggestedResponse,
      });
      console.log(`🎯 Ticket ${ticketId} updated with AI analysis`);

      // === VERIFICATION: Read back from Firebase to confirm ===
      const verifyDoc = await ticketRef.get();
      const savedData = verifyDoc.data();
      
      console.log(`🔍 Verification - Data in Firebase:`, {
        ticketId: ticketId,
        aiAnalysisStatus: savedData.aiAnalysis?.status,
        aiAnalysisMood: savedData.aiAnalysis?.mood,
        aiAnalysisUrgency: savedData.aiAnalysis?.urgency,
        aiAnalysisUrgencyScore: savedData.aiAnalysis?.urgencyScore,
      });

      if (savedData.aiAnalysis?.status === 'done') {
        console.log(`✅ VERIFIED: AI analysis successfully saved to Firebase!`);
        
        // Print beautiful summary box
        const analysisType = savedData.aiAnalysis.reprocessCount > 0 ? '🔄 RE-ANALYZED' : '🆕 FIRST ANALYSIS';
        const reprocessInfo = savedData.aiAnalysis.reprocessCount > 0 
          ? `║ Reprocess Count: ${savedData.aiAnalysis.reprocessCount}${' '.repeat(42)} ║\n`
          : '';
        
        console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
        console.log(`║           🎯 AI ANALYSIS COMPLETED & SAVED                    ║`);
        console.log(`╠════════════════════════════════════════════════════════════════╣`);
        console.log(`║ Type:            ${analysisType.padEnd(42)} ║`);
        console.log(`║ Ticket ID:       ${ticketId.padEnd(42)} ║`);
        console.log(`║ Status:          ✅ DONE ${' '.repeat(39)} ║`);
        console.log(`║                                                                ║`);
        if (reprocessInfo) console.log(reprocessInfo);
        console.log(`║ 📊 AI Analysis Results:                                        ║`);
        console.log(`║ ──────────────────────────────────────────────────────────────║`);
        console.log(`║ Mood:            ${savedData.aiAnalysis.mood.padEnd(42)} ║`);
        console.log(`║ Sentiment:       ${savedData.aiAnalysis.sentiment.padEnd(42)} ║`);
        console.log(`║ Urgency:         ${savedData.aiAnalysis.urgency.toUpperCase().padEnd(42)} ║`);
        console.log(`║ Urgency Score:   ${String(savedData.aiAnalysis.urgencyScore).padEnd(42)} ║`);
        console.log(`║                                                                ║`);
        console.log(`║ Summary:                                                       ║`);
        console.log(`║ ${savedData.aiAnalysis.summary.substring(0, 60).padEnd(62)} ║`);
        console.log(`║                                                                ║`);
        console.log(`║ Suggested Reply:                                               ║`);
        console.log(`║ ${savedData.aiAnalysis.suggestedResponse.substring(0, 60).padEnd(62)} ║`);
        if (savedData.aiAnalysis.suggestedResponse.length > 60) {
          console.log(`║ ${savedData.aiAnalysis.suggestedResponse.substring(60, 120).padEnd(62)} ║`);
        }
        console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
      } else {
        console.warn(`⚠️ WARNING: Status mismatch in Firebase!`);
      }

      return NextResponse.json({
        success: true,
        message: 'AI analysis completed successfully',
        data: {
          ticketId,
          aiAnalysis: {
            status: 'done',
            ...aiResults,
          },
        },
      }, { status: 200 });

    } catch (aiError) {
      // === STEP 6: Handle ERROR ===
      console.error(`❌ AI Analysis error for ticket ${ticketId}:`, aiError.message);

      await ticketRef.update({
        'aiAnalysis.status': 'error',
        'aiAnalysis.processedAt': now,
        'aiAnalysis.error': aiError.message || 'AI analysis failed',
        updatedAt: now,
      });

      return NextResponse.json({
        success: false,
        error: 'AI analysis failed',
        details: aiError.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ AI Worker critical error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Validate Gemini API response
 * Parse and validate JSON response from Gemini
 */
function validateGeminiResponse(geminiResponseText) {
  console.log(`🔍 Parsing and validating Gemini response...`);

  try {
    // Parse response using our parser (handles markdown removal, validation)
    const parsed = parseGeminiResponse(geminiResponseText);
    
    // Map urgency score to level
    const urgencyLevel = mapUrgencyLevel(parsed.urgency_score);
    
    // Map mood to sentiment
    const sentiment = mapMoodToSentiment(parsed.mood);

    const result = {
      mood: parsed.mood,
      sentiment: sentiment,
      urgency: urgencyLevel,
      urgencyScore: parsed.urgency_score,
      summary: parsed.summary,
      suggestedResponse: parsed.suggested_reply,
      category: 'Auto-detected', // Could be enhanced later
    };

    console.log(`✅ Validation complete - All 4 outputs present:`, {
      mood: result.mood,
      sentiment: result.sentiment,
      urgency: result.urgency,
      urgencyScore: result.urgencyScore,
    });

    return result;

  } catch (error) {
    console.error(`❌ Validation failed:`, error.message);
    throw error;
  }
}
