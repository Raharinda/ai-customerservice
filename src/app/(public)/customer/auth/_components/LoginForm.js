'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login, loginWithGoogle } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        console.log('Login form submitted with email:', email)

        try {
            const result = await login(email, password)
            console.log('Login result:', result)

            // Redirect ke customer dashboard
            router.push('/customer')
        } catch (err) {
            console.error('Login form error:', err)
            setError(err.message || 'Login gagal. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError('')
        setLoading(true)

        console.log('Google login initiated')

        try {
            const result = await loginWithGoogle()
            console.log('Google login result:', result)
            router.push('/customer') // Redirect setelah login
        } catch (err) {
            console.error('Google login error:', err)
            setError(
                err.message || 'Login dengan Google gagal. Silakan coba lagi.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full max-w-md mx-auto p-6'>
            <div className='bg-white rounded-lg shadow-md p-8'>
                <h2 className='text-2xl font-bold text-center mb-6'>
                    Customer Login
                </h2>

                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            placeholder='nama@email.com'
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            placeholder='••••••••'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors'
                    >
                        {loading ? 'Loading...' : 'Login sebagai Customer'}
                    </button>
                </form>

                <div className='mt-6'>
                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='px-2 bg-white text-gray-500'>
                                Atau login dengan
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className='mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors'
                    >
                        <FcGoogle size={25} />
                        {loading ? 'Loading...' : 'Login dengan Google'}
                    </button>
                </div>

                <p className='mt-4 text-center text-sm text-gray-600'>
                    Belum punya akun?{' '}
                    <a
                        href='/register'
                        className='text-blue-600 hover:text-blue-700 font-medium'
                    >
                        Daftar di sini
                    </a>
                </p>

                <div className='mt-4 pt-4 border-t border-gray-200'>
                    <p className='text-center text-sm text-gray-600'>
                        Login sebagai Support Agent?{' '}
                        <a
                            href='/agent'
                            className='text-blue-600 hover:text-blue-700 font-medium'
                        >
                            Klik di sini
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
