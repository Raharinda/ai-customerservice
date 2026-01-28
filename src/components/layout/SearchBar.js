import { CiSearch } from 'react-icons/ci'

export default function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className='relative max-w-7xl mx-auto my-5'>
            <CiSearch
                size={20}
                className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                type='text'
                placeholder={placeholder}
                className='w-full rounded-lg bg-zinc-100 py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300'
            />
        </div>
    )
}
