const Pagination = ({ current, total, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  const start = (current - 1) * perPage + 1
  const end = Math.min(current * perPage, total)

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <span>Showing {start}–{end} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
              p === current
                ? 'bg-admin-sidebar text-white border-admin-sidebar'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination
