/**
 * Gemini API Integration with Auto Failover
 * Handle communication with Google Gemini AI
 * Support multiple API keys with automatic rotation on quota errors
 */

import { 
  initKeyTracking, 
  recordApiCall, 
  getKeyStats, 
  printKeyStats 
} from './geminiKeyManager';

const GEMINI_MODEL = 'gemini-2.5-flash'; // ✅ Using Gemini 2.5 Flash (as requested)

// ✅ Multiple API Keys for Auto Failover
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(key => key); // Filter out undefined keys

// Fallback to single key if available
if (GEMINI_API_KEYS.length === 0 && process.env.GEMINI_API_KEY) {
  GEMINI_API_KEYS.push(process.env.GEMINI_API_KEY);
}

if (GEMINI_API_KEYS.length === 0) {
  console.warn('⚠️ No GEMINI_API_KEY found in environment variables');
} else {
  console.log(`🔑 Loaded ${GEMINI_API_KEYS.length} Gemini API key(s)`);
  // Initialize usage tracking
  initKeyTracking(GEMINI_API_KEYS.length);
}

// Track which key to use (start with first key)
let currentKeyIndex = 0;

/**
 * Get current API key
 * @returns {string} - Current API key to use
 */
function getCurrentApiKey() {
  return GEMINI_API_KEYS[currentKeyIndex];
}

/**
 * Rotate to next API key
 * @returns {boolean} - True if successfully rotated, false if no more keys
 */
function rotateApiKey() {
  // Check if there's a next key available
  if (currentKeyIndex >= GEMINI_API_KEYS.length - 1) {
    console.error('❌ No more API keys available to rotate');
    return false;
  }
  
  currentKeyIndex++;
  console.log(`🔄 Rotated to API key #${currentKeyIndex + 1}`);
  return true;
}

/**
 * Reset to first API key (for successful operations)
 */
function resetApiKeyIndex() {
  currentKeyIndex = 0;
}

/**
 * Check if error is a quota/rate limit error
 * @param {Object} errorData - Error response from Gemini
 * @returns {boolean} - True if quota error
 */
function isQuotaError(errorData) {
  const errorMessage = JSON.stringify(errorData).toLowerCase();
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('429') ||
    errorMessage.includes('resource_exhausted')
  );
}

/**
 * Call Gemini API with prompt
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} retries - Number of retries on failure
 * @param {number} keyRotationAttempts - Number of API key rotation attempts
 * @returns {Promise<string>} - Raw text response from Gemini
 */
export async function callGemini(prompt, retries = 2, keyRotationAttempts = 0) {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const apiKey = getCurrentApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  console.log(`🔮 Calling Gemini API... (Key #${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}, retries left: ${retries})`);
  console.log(`📝 Model: ${GEMINI_MODEL}`);
  console.log(`📤 Prompt length: ${prompt.length} characters`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // ✅ Increased to prevent truncated responses
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = `${response.status} ${response.statusText}`;
      
      console.error('❌ Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        keyUsed: `#${currentKeyIndex + 1}`,
      });
      
      // Record failed call
      recordApiCall(currentKeyIndex, false, errorMsg);
      
      // ✅ Check for quota errors and rotate API key
      if (isQuotaError(errorData) && keyRotationAttempts < GEMINI_API_KEYS.length - 1) {
        console.log(`⚠️ QUOTA ERROR detected on API key #${currentKeyIndex + 1}`);
        console.log(`📊 Quota errors so far: ${getKeyStats().quotaErrors}`);
        
        if (rotateApiKey()) {
          console.log(`🔄 Switching to API key #${currentKeyIndex + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          return callGemini(prompt, retries, keyRotationAttempts + 1);
        } else {
          // All keys exhausted
          console.error('❌ ALL API KEYS QUOTA EXHAUSTED!');
          printKeyStats(); // Print final stats
          throw new Error('All API keys exhausted - quota limit reached on all keys');
        }
      }
      
      // ✅ Retry on server errors (5xx) without rotating key
      if (response.status >= 500 && retries > 0) {
        console.log(`🔄 Retrying due to server error... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        return callGemini(prompt, retries - 1, keyRotationAttempts);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('❌ No text in Gemini response:', JSON.stringify(data, null, 2));
      
      // Record failed call
      recordApiCall(currentKeyIndex, false, 'No text generated');
      
      // ✅ Retry if no text generated
      if (retries > 0) {
        console.log(`🔄 Retrying due to empty response... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return callGemini(prompt, retries - 1, keyRotationAttempts);
      }
      
      throw new Error('No text generated by Gemini');
    }

    console.log(`✅ Gemini API response received from key #${currentKeyIndex + 1}`);
    console.log(`📥 Response length: ${generatedText.length} characters`);

    // ✅ Record successful call
    recordApiCall(currentKeyIndex, true);
    
    // ✅ Success - reset to first key for next request
    resetApiKeyIndex();
    
    // Print stats periodically (every 10 successful calls)
    const stats = getKeyStats();
    if (stats.successfulCalls % 10 === 0 && stats.successfulCalls > 0) {
      printKeyStats();
    }

    return generatedText;

  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    
    // Record failed call if not already recorded
    if (!error.message.includes('quota')) {
      recordApiCall(currentKeyIndex, false, error.message);
    }
    
    // ✅ Retry on network errors
    if (retries > 0 && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log(`🔄 Retrying due to network error... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callGemini(prompt, retries - 1, keyRotationAttempts);
    }
    
    throw error;
  }
}

/**
 * Analyze customer support ticket with Gemini
 * @param {Object} ticketData - Ticket data to analyze
 * @param {string} prompt - Generated prompt
 * @returns {Promise<Object>} - Parsed AI analysis result
 */
export async function analyzeTicketWithGemini(ticketData, prompt) {
  console.log(`🤖 Starting Gemini analysis for ticket...`);
  
  try {
    // Call Gemini API
    const geminiResponse = await callGemini(prompt);
    
    console.log(`✅ Gemini analysis complete`);
    
    return geminiResponse;

  } catch (error) {
    console.error('❌ Gemini analysis failed:', error.message);
    throw error;
  }
}
