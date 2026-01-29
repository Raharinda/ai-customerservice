import { NextResponse } from 'next/server';
import { getKeyStats } from '@/lib/geminiKeyManager';

/**
 * GET /api/ai/key-status
 * Get Gemini API keys usage statistics
 * For monitoring and debugging purposes
 */
export async function GET(request) {
  try {
    console.log('📊 GET /api/ai/key-status - Checking API key statistics');

    const stats = getKeyStats();

    return NextResponse.json({
      success: true,
      message: 'API key statistics retrieved',
      data: stats,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error getting key stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
