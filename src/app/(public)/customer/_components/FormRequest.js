'use client'

import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { useForm } from 'react-hook-form'

export default function FormRequest() {
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, formState } = useForm()

    const onSubmit = (data) => {
        console.log(data)
        setOpen(false)
    }

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-4 py-2 px-4 text-white bg-black rounded-xl text-sm'
            >
                <FaPlus size={14} />
                New Request
            </button>

            {/* OVERLAY */}
            {open && (
                <div className='fixed inset-0 z-1 bg-black/50 flex items-center justify-center min-w-100'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='bg-white p-6 rounded-xl space-y-6'
                    >
                        {/* FORM HEADER */}
                        <div className='space-y-1'>
                            <h2 className='text-xl font-semibold'>
                                Submit a Support Request
                            </h2>
                            <p className='text-sm text-gray-500'>
                                Our AI will analyze your request and help route
                                it to the right team
                            </p>
                        </div>

                        {/* FIELD */}
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
                            >
                                <option value=''>Technical Issue</option>
                                <option value='billing'>
                                    Billing & Payment
                                </option>
                                <option value='technical'>
                                    Feature Request
                                </option>
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
                                className='w-full rounded-lg bg-black py-3 text-white text-sm font-medium'
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
