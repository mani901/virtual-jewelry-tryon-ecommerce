const QuantitySelector = ({ value, onChange, min = 1, max = 99, className = '' }) => {
  const decrement = () => { if (value > min) onChange(value - 1) }
  const increment = () => { if (value < max) onChange(value + 1) }

  return (
    <div className={`inline-flex items-center border border-gray-300 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
        </svg>
      </button>
      <span className="w-8 text-center text-sm font-medium select-none">{value}</span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
      </button>
    </div>
  )
}

export default QuantitySelector
