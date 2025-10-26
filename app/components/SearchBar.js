export default function SearchBar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search input with clear button */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {/* Clear button - only shown when there's a search query */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort dropdown */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="alphabetical">A-Z</option>
      </select>
    </div>
  );
}
