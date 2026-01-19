'use client'

import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function FormRequest() {
    const [open, setOpen] = useState(false)
    const { register, handleSubmit } = useForm()
    const { user } = useAuth()
    const router = useRouter()

    const onSubmit = (data) => {
        console.log(data)
        setOpen(false)
    }

    const handleOpen = () => {
        if (!user) {
            router.push('/login')
            return
        }
        setOpen(true)
    }
    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-4 py-2 px-4 text-white bg-blue-500 rounded-xl text-sm hover:bg-blue-700'
            >
                <FaPlus size={14} />
                New Request
            </button>

            {/* Overlay */}
            {open && (
                <div className='fixed inset-0 z-1 bg-black/50 flex items-center justify-center min-w-100'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='bg-white p-6 rounded-xl space-y-6'
                    >
                        {/* Form Header */}
                        <div className='space-y-1'>
                            <h2 className='text-xl font-semibold'>
                                Submit a Support Request
                            </h2>
                            <p className='text-sm text-gray-500'>
                                Our AI will analyze your request and help route
                                it to the right team
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
                                {...register('category', { required: true })}
                                className='w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm'
                                defaultValue={''}
                            >
                                <option value='' disabled>
                                    Select category
                                </option>
                                <option value='Technical'>
                                    Technical Issue
                                </option>
                                <option value='billing'>
                                    Billing & Payment
                                </option>
                                <option value='feature'>Feature Request</option>
                                <option value='account'>Account Access</option>
                                <option value='other'>Other</option>
                            </select>
                        </div>

                        <div className='space-y-1'>
                            <label className='text-sm font-medium'>
                                Description
                            </label>
                            <textarea
                                {...register('description', { required: true })}
                                className='w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm'
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
                                onClick={() => setOpen(false)}
                                className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium'
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
