/**
 * Gemini API Key Manager
 * Monitor and manage multiple API keys with usage tracking
 */

// Track API key usage and errors
const keyStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  quotaErrors: 0,
  keyUsage: {},
};

/**
 * Initialize key usage tracking
 * @param {number} totalKeys - Total number of API keys
 */
export function initKeyTracking(totalKeys) {
  for (let i = 0; i < totalKeys; i++) {
    keyStats.keyUsage[i] = {
      calls: 0,
      success: 0,
      quotaErrors: 0,
      lastUsed: null,
      lastError: null,
    };
  }
}

/**
 * Record API call result
 * @param {number} keyIndex - Index of the key used
 * @param {boolean} success - Whether call was successful
 * @param {string} error - Error message if failed
 */
export function recordApiCall(keyIndex, success, error = null) {
  keyStats.totalCalls++;
  
  if (success) {
    keyStats.successfulCalls++;
    keyStats.keyUsage[keyIndex].success++;
  } else {
    keyStats.failedCalls++;
    if (error && (error.includes('quota') || error.includes('rate limit'))) {
      keyStats.quotaErrors++;
      keyStats.keyUsage[keyIndex].quotaErrors++;
    }
    keyStats.keyUsage[keyIndex].lastError = error;
  }
  
  keyStats.keyUsage[keyIndex].calls++;
  keyStats.keyUsage[keyIndex].lastUsed = new Date().toISOString();
}

/**
 * Get current statistics
 * @returns {Object} - Usage statistics
 */
export function getKeyStats() {
  return {
    ...keyStats,
    successRate: keyStats.totalCalls > 0 
      ? ((keyStats.successfulCalls / keyStats.totalCalls) * 100).toFixed(2) + '%'
      : '0%',
  };
}

/**
 * Print statistics to console
 */
export function printKeyStats() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         🔑 GEMINI API KEYS USAGE STATISTICS                   ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ Total Calls:       ${String(keyStats.totalCalls).padEnd(42)} ║`);
  console.log(`║ Successful:        ${String(keyStats.successfulCalls).padEnd(42)} ║`);
  console.log(`║ Failed:            ${String(keyStats.failedCalls).padEnd(42)} ║`);
  console.log(`║ Quota Errors:      ${String(keyStats.quotaErrors).padEnd(42)} ║`);
  console.log(`║ Success Rate:      ${getKeyStats().successRate.padEnd(42)} ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  
  Object.entries(keyStats.keyUsage).forEach(([keyIndex, stats]) => {
    console.log(`║ Key #${(parseInt(keyIndex) + 1).toString().padEnd(2)} Stats:                                              ║`);
    console.log(`║   Calls:           ${String(stats.calls).padEnd(40)} ║`);
    console.log(`║   Success:         ${String(stats.success).padEnd(40)} ║`);
    console.log(`║   Quota Errors:    ${String(stats.quotaErrors).padEnd(40)} ║`);
    console.log(`║   Last Used:       ${(stats.lastUsed || 'Never').substring(0, 40).padEnd(40)} ║`);
    if (stats.lastError) {
      console.log(`║   Last Error:      ${stats.lastError.substring(0, 40).padEnd(40)} ║`);
    }
    console.log('║                                                                ║');
  });
  
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

/**
 * Reset statistics
 */
export function resetKeyStats() {
  keyStats.totalCalls = 0;
  keyStats.successfulCalls = 0;
  keyStats.failedCalls = 0;
  keyStats.quotaErrors = 0;
  
  Object.keys(keyStats.keyUsage).forEach(key => {
    keyStats.keyUsage[key] = {
      calls: 0,
      success: 0,
      quotaErrors: 0,
      lastUsed: null,
      lastError: null,
    };
  });
}
