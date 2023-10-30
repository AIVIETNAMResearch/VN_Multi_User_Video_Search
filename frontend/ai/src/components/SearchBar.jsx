import React from 'react'
import { AiOutlineSearch } from 'react-icons/ai'


function SearchBar({handleSearch}) {
  return (
    <div className='w-full relative container mx-auto my-6'>
      <div className="relative w-full hover:ease-in-out duration-300 hover:drop-shadow-[0px_4px_3px_rgba(255,255,255,0.4)]">
      <input type="search" placeholder='Type here...' className='relative w-full p-4 rounded-full bg-slate-800'
          onChange={e => setQuery(e.target.value)}/>
          <button type="button" className='absolute right-1 top-1/2 -translate-y-1/2 p-4 bg-slate-800 rounded-full'
            onClick={() => {handleSearch()}}>
              <AiOutlineSearch />
          </button>
      </div>
    </div>
  )
}

export default SearchBar