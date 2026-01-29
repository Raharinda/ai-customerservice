'use client'

import { FaRobot, FaLightbulb } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import { BiLoaderAlt } from 'react-icons/bi'

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

    const getSentimentStyle = (sentiment) => {
        const styles = {
            positive: 'bg-green-50 border-green-200 text-green-800',
            neutral: 'bg-gray-50 border-gray-200 text-gray-800',
            negative: 'bg-red-50 border-red-200 text-red-800',
            frustrated: 'bg-orange-50 border-orange-200 text-orange-800',
            urgent: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        }
        return (
            styles[sentiment?.toLowerCase()] ||
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
        <div className='rounded-xl border border-gray-200 bg-white p-6 mb-6'>
            {/* Header */}
            <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-4'>
                    <div className='p-2 rounded-lg bg-purple-600'>
                        <HiSparkles className='w-5 h-5 text-white' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-900'>
                            AI Analysis & Suggestions
                        </h3>
                        <p className='text-xs text-gray-500 mt-0.5'>
                            {analyzing
                                ? 'Updating analysis...'
                                : 'Based on full conversation'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onReanalyze}
                    disabled={analyzing}
                    className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {analyzing ? (
                        <>
                            <BiLoaderAlt className='w-4 h-4 animate-spin' />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <FaRobot className='w-4 h-4' />
                            Re-analyze
                        </>
                    )}
                </button>
            </div>

            {/* Sentiment & Mood */}
            {(aiAnalysis.sentiment || aiAnalysis.mood) && (
                <div className='flex flex-wrap gap-3 mb-6'>
                    {aiAnalysis.sentiment && (
                        <div
                            className={`flex items-center gap-3
                                        px-4 py-3 rounded-lg border
                                        ${getSentimentStyle(
                                            aiAnalysis.sentiment,
                                        )}`}
                        >
                            <span className='text-lg'>
                                {getSentimentIcon(aiAnalysis.sentiment)}
                            </span>
                            <div>
                                <p className='text-xs opacity-70'>Sentiment</p>
                                <p className='text-sm font-semibold capitalize'>
                                    {aiAnalysis.sentiment}
                                </p>
                            </div>
                        </div>
                    )}

                    {aiAnalysis.mood && (
                        <div
                            className='flex items-center gap-3
                                        px-4 py-3 rounded-lg border
                                        bg-gray-50 border-gray-200 text-gray-800'
                        >
                            <span className='text-lg'>
                                {getMoodEmoji(aiAnalysis.mood)}
                            </span>
                            <div>
                                <p className='text-xs opacity-70'>Mood</p>
                                <p className='text-sm font-semibold capitalize'>
                                    {aiAnalysis.mood}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI Summary */}
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-5 mb-6'>
                <div className='grid grid-cols-[20px_1fr] gap-3'>
                    <FaRobot className='w-4 h-4 text-purple-600 mt-1' />
                    <div>
                        <h4 className='text-sm font-semibold text-gray-900 mb-1'>
                            AI Summary
                        </h4>
                        <p className='text-sm text-gray-700 leading-relaxed'>
                            {aiAnalysis.summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* Suggested Response */}
            {aiAnalysis.suggestedResponse && (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-5'>
                    <div className='grid grid-cols-[20px_1fr] gap-3 mb-4'>
                        <FaLightbulb className='w-4 h-4 text-blue-600 mt-1' />
                        <div>
                            <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                                Suggested Response
                            </h4>
                            <p className='text-sm text-blue-900 italic leading-relaxed'>
                                {aiAnalysis.suggestedResponse}
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-start'>
                        <button
                            onClick={() =>
                                onUseSuggestedResponse(
                                    aiAnalysis.suggestedResponse,
                                )
                            }
                            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white'
                        >
                            <FaLightbulb className='w-3 h-3' />
                            Use this response
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
