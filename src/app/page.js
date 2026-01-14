'use client'

import Link from 'next/link'
import { AiOutlineCustomerService } from 'react-icons/ai'
import { FaRegMessage } from 'react-icons/fa6'

export default function Home() {
    return (
        <main className='flex flex-col justify-center'>
            {/* Navbar */}
            <nav className='flex justify-between p-5 font-bold text-xl shadow'>
                <h1 className='cursor-pointer hover:text-blue-600 transition-opacity delay-300'>
                    SupportAI
                </h1>
            </nav>

            {/* Hero Section */}
            <section className='flex flex-col items-center mt-20'>
                <h1 className='text-5xl font-bold'>
                    AI-Powered Customer Service
                </h1>

                <p className='mt-4 text-center max-w-xl text-gray-600'>
                    Automatically analyze customer messages, classify issues,
                    understand sentiment, and generate intelligent response
                    suggestions to help your team work faster and more
                    efficiently.
                </p>
            </section>

            {/* Role Selection Section */}
            <section className='flex flex-col items-center justify-center'>
                <div className='flex-col pt-20'>
                    <h2 className='font-bold text-2xl'>Choose your role</h2>
                </div>

                {/* Cards Container */}
                <div className='p-10 flex items-center justify-center'>
                    <div className='flex gap-20 items-stretch'>
                        {/* Customer Card */}
                        <article className='max-w-96 h-full flex flex-col shadow-md p-10 gap-x-10 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl group'>
                            {/* Icon Container */}
                            <div className='flex justify-center mb-6'>
                                <div className='w-28 h-28 flex items-center justify-center rounded-full bg-sky-100 transition-all duration-300 group-hover:bg-blue-500'>
                                    <FaRegMessage
                                        size={50}
                                        className='text-blue-700 transition-all duration-300 group-hover:text-white'
                                    />
                                </div>
                            </div>

                            {/* Card Body */}
                            <h2 className='text-xl font-bold text-center mb-8'>
                                Customer
                            </h2>
                            <p className='text-center'>
                                Access AI-powered tools to analyze
                                conversations, classify issues by urgency,
                                understand customer sentiment, and get
                                intelligent response suggestions.
                            </p>

                            {/* Button */}
                            <div className='mt-10 p-2 text-center bg-blue-500 rounded-xl text-white hover:bg-blue-700'>
                                <Link href='/customer'>
                                    Continue as Customer
                                </Link>
                            </div>
                        </article>

                        {/* Support Agent Card */}
                        <article className='max-w-96 h-full flex flex-col shadow-md p-10 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl group'>
                            {/* Icon Container */}
                            <div className='flex justify-center mb-6'>
                                <div className='w-28 h-28 flex items-center justify-center rounded-full bg-sky-100 transition-all duration-300 group-hover:bg-blue-500'>
                                    <AiOutlineCustomerService
                                        size={50}
                                        className='text-blue-700 transition-all duration-300 group-hover:text-white'
                                    />
                                </div>
                            </div>

                            {/* Card Body */}
                            <h2 className='text-xl font-bold text-center mb-8'>
                                Support Agent
                            </h2>
                            <p className='text-center'>
                                Submit your support requests and get help from
                                our team. Track your conversations and receive
                                timely responses to all your inquiries.
                            </p>

                            {/* Button */}
                            <div className='mt-16 p-2 text-center bg-blue-500 rounded-xl text-white hover:bg-blue-700'>
                                <Link href='/agent'>Continue as Agent</Link>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    )
}
