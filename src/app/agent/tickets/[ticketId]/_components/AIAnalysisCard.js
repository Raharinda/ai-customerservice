'use client'

import { FaRobot, FaLightbulb } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import { BiLoaderAlt } from 'react-icons/bi'

/**
 * AIAnalysisCard Component
 * Displays AI analysis with sentiment, mood, summary, and suggested response
 */
export default function AIAnalysisCard({
    aiAnalysis,
    analyzing,
    onReanalyze,
    onUseSuggestedResponse,
}) {
    if (!aiAnalysis?.summary) return null

    const getSentimentIcon = (sentiment) => {
        const icons = {
            positive: '😊',
            neutral: '😐',
            negative: '😔',
            frustrated: '😤',
            urgent: '⚠️',
        }
        return icons[sentiment?.toLowerCase()] || '💬'
    }

    const getSentimentColor = (sentiment) => {
        const colors = {
            positive: 'bg-green-50 border-green-200 text-green-800',
            neutral: 'bg-gray-50 border-gray-200 text-gray-800',
            negative: 'bg-red-50 border-red-200 text-red-800',
            frustrated: 'bg-orange-50 border-orange-200 text-orange-800',
            urgent: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        }
        return (
            colors[sentiment?.toLowerCase()] ||
            'bg-blue-50 border-blue-200 text-blue-800'
        )
    }

    const getMoodEmoji = (mood) => {
        const emojis = {
            stressed: '😰',
            frustrated: '😤',
            confused: '🤔',
            calm: '😌',
            satisfied: '😊',
            happy: '😄',
            angry: '😠',
        }
        return emojis[mood?.toLowerCase()] || '😐'
    }

    return (
        <div
            className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 rounded-xl p-6 mb-6 transition-all duration-300 ${
                analyzing
                    ? 'border-purple-400 animate-pulse'
                    : 'border-purple-200'
            }`}
        >
            {/* Header */}
            <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <div className='bg-purple-600 p-2 rounded-lg'>
                        <HiSparkles className='w-5 h-5 text-white' />
                    </div>
                    <div>
                        <h3 className='font-bold text-purple-900'>
                            AI Analysis & Suggestions
                        </h3>
                        <p className='text-xs text-purple-700'>
                            {analyzing
                                ? 'Updating...'
                                : 'Based on full conversation'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onReanalyze}
                    disabled={analyzing}
                    className='flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg disabled:opacity-50 transition-colors'
                >
                    {analyzing ? (
                        <>
                            <BiLoaderAlt className='w-3.5 h-3.5 animate-spin' />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <FaRobot className='w-3.5 h-3.5' />
                            Re-analyze
                        </>
                    )}
                </button>
            </div>

            {/* Sentiment & Mood Badges */}
            {(aiAnalysis.sentiment || aiAnalysis.mood) && (
                <div className='flex flex-wrap gap-3 mb-4'>
                    {aiAnalysis.sentiment && (
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getSentimentColor(aiAnalysis.sentiment)}`}
                        >
                            <span className='text-lg'>
                                {getSentimentIcon(aiAnalysis.sentiment)}
                            </span>
                            <div>
                                <p className='text-xs opacity-70'>Sentiment</p>
                                <p className='text-sm font-bold capitalize'>
                                    {aiAnalysis.sentiment}
                                </p>
                            </div>
                        </div>
                    )}
                    {aiAnalysis.mood && (
                        <div className='flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg'>
                            <span className='text-lg'>
                                {getMoodEmoji(aiAnalysis.mood)}
                            </span>
                            <div>
                                <p className='text-xs opacity-70'>Mood</p>
                                <p className='text-sm font-bold capitalize'>
                                    {aiAnalysis.mood}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Summary */}
            {aiAnalysis.summary && (
                <div className='bg-white bg-opacity-60 rounded-lg p-4 mb-4'>
                    <div className='flex items-start gap-2 mb-2'>
                        <FaRobot className='w-4 h-4 text-purple-600 mt-0.5' />
                        <h4 className='text-sm font-bold text-purple-900'>
                            AI Summary
                        </h4>
                    </div>
                    <p className='text-sm text-gray-800 ml-6'>
                        {aiAnalysis.summary}
                    </p>
                </div>
            )}

            {/* Suggested Response */}
            {aiAnalysis.suggestedResponse && (
                <div className='bg-white bg-opacity-60 rounded-lg p-4'>
                    <div className='flex items-start gap-2 mb-2'>
                        <FaLightbulb className='w-4 h-4 text-blue-600 mt-0.5' />
                        <h4 className='text-sm font-bold text-blue-900'>
                            Suggested Response
                        </h4>
                    </div>
                    <p className='text-sm text-gray-800 italic ml-6 mb-3'>
                        {aiAnalysis.suggestedResponse}
                    </p>
                    <button
                        onClick={() =>
                            onUseSuggestedResponse(aiAnalysis.suggestedResponse)
                        }
                        className='ml-6 flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors'
                    >
                        <FaLightbulb className='w-3 h-3' />
                        Use this response
                    </button>
                </div>
            )}
        </div>
    )
}
