'use client'

import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function FormRequest() {
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, reset } = useForm()
    const { user } = useAuth()
    const router = useRouter()

    const onSubmit = async (data) => {
        try {
            const idToken = await auth.currentUser.getIdToken(true)
            const res = await fetch('/api/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: data.subject,
                    category: data.category,
                    description: data.description,
                    idToken,
                    createInitialMessage: true, // Flag untuk create message otomatis
                }),
            })

            // Clone the response so we can read it multiple times if needed
            const clonedRes = res.clone()

            let result
            try {
                result = await res.json()
            } catch {
                // Use the cloned response for text
                const raw = await clonedRes.text()
                console.error('Non-JSON response:', raw)
                throw new Error('Server response is not JSON')
            }

            if (!res.ok)
                throw new Error(result.error || 'Gagal mengirim request')

            setOpen(false)
            reset() // Reset form setelah sukses
            alert('Request berhasil dikirim')
        } catch (err) {
            console.error(err)
            alert(err.message || 'Terjadi kesalahan')
        }
    }

    const handleOpen = () => {
        if (!user) {
            router.push('/login')
            return
        }
        setOpen(true)
    }

    const handleCancel = () => {
        setOpen(false)
        reset() // Reset form saat cancel
    }

    return (
        <div>
            <ProtectedRoute>
                <button
                    onClick={handleOpen}
                    className='flex items-center gap-4 py-2 px-4 text-white bg-blue-500 rounded-xl text-sm hover:bg-blue-700'
                >
                    <FaPlus size={14} />
                    New Request
                </button>

                {/* Overlay */}
                {open && (
                    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center min-w-100'>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className='bg-white p-6 rounded-xl space-y-6 max-w-lg w-full mx-4'
                        >
                            {/* Form Header */}
                            <div className='space-y-1'>
                                <h2 className='text-xl font-semibold'>
                                    Submit a Support Request
                                </h2>
                                <p className='text-sm text-gray-500'>
                                    Our AI will analyze your request and help
                                    route it to the right team
                                </p>
                            </div>

                            {/* Form Body */}
                            <div className='space-y-1'>
                                <label className='text-sm font-medium'>
                                    Subject
                                </label>
                                <input
                                    {...register('subject', { required: true })}
                                    placeholder='Brief description of your issue'
                                    className='w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300'
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-sm font-medium'>
                                    Category
                                </label>
                                <select
                                    {...register('category', {
                                        required: true,
                                    })}
                                    className='w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm'
                                    defaultValue={''}
                                >
                                    <option value='' disabled>
                                        Select category
                                    </option>
                                    <option value='Technical'>
                                        Technical Issue
                                    </option>
                                    <option value='Billing'>
                                        Billing & Payment
                                    </option>
                                    <option value='Feature'>
                                        Feature Request
                                    </option>
                                    <option value='Support'>
                                        Account Access
                                    </option>
                                    <option value='General'>Other</option>
                                </select>
                            </div>

                            <div className='space-y-1'>
                                <label className='text-sm font-medium'>
                                    Description
                                </label>
                                <textarea
                                    {...register('description', {
                                        required: true,
                                    })}
                                    className='w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm min-h-32'
                                    placeholder='Please provide details about your issue...'
                                />
                            </div>

                            <div className='flex gap-4'>
                                <button
                                    type='submit'
                                    className='w-full rounded-lg bg-blue-500 py-3 text-white text-sm font-medium hover:bg-blue-700'
                                >
                                    Submit Request
                                </button>
                                <button
                                    type='button'
                                    onClick={handleCancel}
                                    className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </ProtectedRoute>
        </div>
    )
}
