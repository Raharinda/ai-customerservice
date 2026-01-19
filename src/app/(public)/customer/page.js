'use client'
import LoginForm from '@/components/auth/LoginForm'
import FormRequest from './_components/FormRequest'
import SearchBar from './_components/SearchBar'
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'

export default function page() {
    return (
        <div>
            {/* Navbar */}
            <div className='flex flex-col gap-4 p-5 shadow-sm justify-between'>
                <div className='flex items-center justify-between'>
                    {/* Left Side */}
                    <div>
                        <h1 className='text-xl font-bold'>
                            <Link href='/'>Support AI</Link>
                        </h1>
                    </div>

                    {/* Right Side */}
                    <div className='flex gap-2'>
                        <FormRequest />
                        <AuthButton />
                    </div>
                </div>
            </div>

            <SearchBar />
        </div>
    )
}
