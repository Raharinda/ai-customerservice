/**
 * Gemini AI Prompt Generator
 * Generate prompt for analyzing customer support messages
 * Supports both Indonesian and English
 */

/**
 * Generate analysis prompt for Gemini AI (initial message only)
 * @param {Object} ticketData - Ticket data containing customer message
 * @returns {string} - Formatted prompt for Gemini
 */
export function generateAnalysisPrompt(ticketData) {
  const customerMessage = ticketData.description || ticketData.message || '';
  
  const prompt = `You are an AI assistant for customer support agents.

Analyze the following customer message and return ONLY valid JSON with these fields:

1. mood: the customer's emotional state (1–2 words, e.g., "frustrated", "angry", "calm", "confused", "urgent", "neutral")
2. urgency_score: number from 1 to 100 indicating how urgent this issue is (1 = not urgent, 100 = critical emergency)
3. summary: one short sentence summarizing the customer's main issue or request (max 100 characters)
4. suggested_reply: one professional and helpful reply the support agent can send (max 200 characters)

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no code blocks, no explanation
- MUST close all JSON strings and objects properly
- Keep suggested_reply SHORT (under 200 characters)
- Support both Indonesian and English messages
- Do NOT wrap response in markdown code blocks
- Output must be parseable by JSON.parse()

Customer message:
"""
${customerMessage}
"""

Expected output (complete valid JSON):
{"mood": "frustrated", "urgency_score": 82, "summary": "Customer cannot access account", "suggested_reply": "Hello! I'll help you resolve the login issue. Please try resetting your password."}`;

  return prompt;
}

/**
 * Generate analysis prompt with FULL CONVERSATION CONTEXT (for re-analysis)
 * @param {string} subject - Ticket subject
 * @param {string} conversationContext - Formatted conversation history
 * @returns {string} - Formatted prompt for Gemini
 */
export function generateAnalysisPromptWithConversation(subject, conversationContext) {
  const prompt = `You are an AI assistant for customer support agents.

Analyze this ENTIRE customer support conversation and return ONLY valid JSON with these fields:

1. mood: the customer's current emotional state after the conversation (1–2 words, e.g., "frustrated", "angry", "calm", "satisfied", "escalated", "resolved")
2. urgency_score: number from 1 to 100 indicating how urgent this issue is NOW (consider the full context)
3. summary: one short sentence summarizing the current state and main issue (max 150 characters)
4. suggested_reply: one professional and helpful next step the support agent can take (max 200 characters)

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no code blocks, no explanation
- MUST close all JSON strings and objects properly
- Keep suggested_reply SHORT (under 200 characters)
- Support both Indonesian and English messages
- Consider the FULL conversation to assess urgency and mood
- Do NOT wrap response in markdown code blocks
- Output must be parseable by JSON.parse()

Ticket subject: ${subject}

Full conversation:
"""
${conversationContext}
"""

Expected output (complete valid JSON):
{"mood": "frustrated", "urgency_score": 82, "summary": "Customer still waiting for account access", "suggested_reply": "I'll escalate this to our technical team immediately for priority resolution."}`;

  return prompt;
}

/**
 * Parse and validate Gemini AI response
 * @param {string} responseText - Raw response from Gemini
 * @returns {Object} - Parsed and validated result
 */
export function parseGeminiResponse(responseText) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    
    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();

    // ✅ FIX: Handle incomplete JSON (unterminated strings)
    // Try to fix common issues with incomplete responses
    if (!cleanedText.endsWith('}')) {
      console.warn('⚠️ JSON appears incomplete, attempting to fix...');
      
      // Find the last complete field
      const lastCommaIndex = cleanedText.lastIndexOf(',');
      const lastQuoteIndex = cleanedText.lastIndexOf('"');
      
      // If there's an unterminated string, close it and the object
      if (lastQuoteIndex > lastCommaIndex) {
        // Count quotes to see if we have an odd number (unterminated)
        const quoteCount = (cleanedText.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          cleanedText += '"'; // Close the string
        }
      }
      
      // Close the JSON object
      cleanedText += '}';
      
      console.log('🔧 Fixed JSON:', cleanedText);
    }

    // Parse JSON
    const parsed = JSON.parse(cleanedText);

    // Validate required fields
    if (!parsed.mood || typeof parsed.mood !== 'string') {
      throw new Error('Invalid or missing "mood" field');
    }

    if (typeof parsed.urgency_score !== 'number' || parsed.urgency_score < 1 || parsed.urgency_score > 100) {
      throw new Error('Invalid "urgency_score" - must be number between 1-100');
    }

    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Invalid or missing "summary" field');
    }

    if (!parsed.suggested_reply || typeof parsed.suggested_reply !== 'string') {
      throw new Error('Invalid or missing "suggested_reply" field');
    }

    return {
      mood: parsed.mood.trim(),
      urgency_score: Math.min(100, Math.max(1, Math.round(parsed.urgency_score))),
      summary: parsed.summary.trim(),
      suggested_reply: parsed.suggested_reply.trim(),
    };

  } catch (error) {
    console.error('❌ Failed to parse Gemini response:', error.message);
    console.error('Raw response:', responseText);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Map urgency score to urgency level
 * @param {number} score - Urgency score (1-100)
 * @returns {string} - Urgency level (low|medium|high|critical)
 */
export function mapUrgencyLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Map mood to sentiment
 * @param {string} mood - Customer mood
 * @returns {string} - Sentiment (positive|neutral|negative)
 */
export function mapMoodToSentiment(mood) {
  const moodLower = mood.toLowerCase();
  
  const negativeMoods = ['angry', 'frustrated', 'upset', 'annoyed', 'disappointed', 'irritated', 'furious', 'marah', 'kesal', 'kecewa'];
  const positiveMoods = ['happy', 'satisfied', 'pleased', 'grateful', 'thankful', 'senang', 'puas', 'terima kasih'];
  
  if (negativeMoods.some(neg => moodLower.includes(neg))) {
    return 'negative';
  }
  
  if (positiveMoods.some(pos => moodLower.includes(pos))) {
    return 'positive';
  }
  
  return 'neutral';
}
