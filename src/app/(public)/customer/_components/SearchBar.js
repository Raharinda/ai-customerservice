import React from 'react'
import { CiSearch } from 'react-icons/ci'

export default function SearchBar() {
    return (
        <div className='relative max-w-7xl mx-auto my-5'>
            <CiSearch
                size={20}
                className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
            />

            <input
                type='text'
                placeholder='Search your tickets...'
                className='w-full rounded-lg bg-zinc-100 py-3 pl-12 pr-4 text-sm ring-gray-400 focus:outline-none focus:border-0 focus:ring-3 focus:ring-gray-300'
            />
        </div>
    )
}
