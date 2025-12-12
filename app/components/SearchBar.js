export default function SearchBar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div className="flex gap-3">
      {/* Search input with glassmorphism */}
      <div className="flex-1 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
          🔍
        </div>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 glass-card focus:outline-none transition-all duration-300"
          style={{
            color: 'var(--glass-white)',
            borderRadius: '16px',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 24px rgba(0, 212, 255, 0.4), 0 8px 32px rgba(107, 45, 255, 0.2)';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = '';
            e.target.style.borderColor = 'var(--glass-border)';
          }}
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all hover:scale-110 glass-card"
            style={{
              color: 'var(--glass-white)',
              borderRadius: '50%',
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort dropdown with glass styling */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-5 py-4 glass-card focus:outline-none transition-all duration-300 cursor-pointer"
        style={{
          color: 'var(--glass-white)',
          borderRadius: '16px',
          minWidth: '160px',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '0 0 24px rgba(0, 255, 157, 0.4), 0 8px 32px rgba(107, 45, 255, 0.2)';
          e.target.style.borderColor = 'rgba(0, 255, 157, 0.5)';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = '';
          e.target.style.borderColor = 'var(--glass-border)';
        }}
      >
        <option value="newest">⏰ Newest</option>
        <option value="oldest">📅 Oldest</option>
        <option value="alphabetical">🔤 A-Z</option>
      </select>
    </div>
  );
}
