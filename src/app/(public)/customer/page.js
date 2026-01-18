'use client'
import FormRequest from './_components/FormRequest'
import SearchBar from './_components/SearchBar'

export default function page() {
    return (
        <div>
            <div className='flex flex-col gap-4 p-5 shadow-sm justify-between'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-xl font-bold'>Support AI</h1>
                    </div>
                    <FormRequest />
                </div>
            </div>

            <SearchBar />
        </div>
    )
}
