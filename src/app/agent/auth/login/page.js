'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaFingerprint } from 'react-icons/fa6'

export default function AgentLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [agentKey, setAgentKey] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { loginAsAgent, refreshUser } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        console.log('📝 Agent login form submitted with email:', email)

        try {
            const result = await loginAsAgent(email, password, agentKey)
            console.log('✅ Agent login result:', result)

            // ✅ FIX: Tunggu auth state update selesai
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Force refresh user data untuk memastikan role ter-update
            console.log('🔄 Refreshing user data to get updated role...')
            await refreshUser()

            // Redirect ke agent dashboard
            console.log('🔄 Redirecting to agent dashboard...')
            router.push('/agent/dashboard')
        } catch (err) {
            console.error('❌ Agent login form error:', err)
            setError(err.message || 'Login gagal. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100'>
            <div className='w-full max-w-md mx-auto p-6'>
                <div className='bg-white rounded-lg shadow-xl p-8'>
                    {/* Header */}
                    <div className='text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                            <FaFingerprint size={30} />
                        </div>
                        <h2 className='text-2xl font-bold text-gray-900'>
                            Support Agent Login
                        </h2>
                        <p className='text-sm text-gray-600 mt-2'>
                            Login dengan kredensial agent Anda
                        </p>
                    </div>

                    {error && (
                        <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Email
                            </label>
                            <input
                                type='email'
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                placeholder='agent@example.com'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Password
                            </label>
                            <input
                                type='password'
                                id='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                placeholder='••••••••'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='agentKey'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Agent Key{' '}
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type='password'
                                id='agentKey'
                                value={agentKey}
                                onChange={(e) => setAgentKey(e.target.value)}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                placeholder='Masukkan agent key'
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                Agent key diperlukan untuk akses dashboard
                                support agent
                            </p>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium'
                        >
                            {loading ? (
                                <span className='flex items-center justify-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle
                                            className='opacity-25'
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                        ></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Login sebagai Support Agent'
                            )}
                        </button>
                    </form>

                    <div className='mt-6 text-center'>
                        <Link
                            href='/'
                            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                        >
                            ← Kembali ke halaman utama
                        </Link>
                    </div>
                </div>

                <div className='mt-4 text-center text-xs text-gray-600'>
                    <p>Tidak punya akses agent? Hubungi administrator Anda.</p>
                </div>
            </div>
        </div>
    )
}
