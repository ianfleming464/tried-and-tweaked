export default function SearchBar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div className='flex gap-4 flex-wrap'>
      {/* Search input */}
      <div className='flex-1 relative' style={{ minWidth: '250px' }}>
        <input
          type='text'
          placeholder='Search recipes...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-full px-5 py-3.5 body-text focus:outline-none transition-all duration-300'
          style={{
            border: '2px solid var(--border-subtle)',
            borderRadius: '4px',
            background: 'var(--white)',
          }}
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className='absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center transition-all hover:scale-110'
            style={{
              color: 'var(--medium-gray)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
            aria-label='Clear search'>
            ×
          </button>
        )}
      </div>

      {/* Sort dropdown */}
      <div className='relative inline-block'>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className='appearance-none px-5 py-3.5 body-text focus:outline-none transition-all duration-300 cursor-pointer'
          style={{
            border: '2px solid var(--border-subtle)',
            borderRadius: '4px',
            background: 'var(--white)',
            minWidth: '160px',
          }}>
          <option value='newest'>Newest First</option>
          <option value='oldest'>Oldest First</option>
          <option value='alphabetical'>Alphabetical</option>
        </select>
        {/* Custom arrow */}
        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2' style={{ color: 'var(--medium-gray)', fontSize: '0.75rem' }}>
          ▼
        </span>
      </div>
    </div>
  );
}
