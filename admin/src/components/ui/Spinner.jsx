const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-[3px]',
}

const colors = {
  accent: 'border-admin-accent border-t-transparent',
  white: 'border-white border-t-transparent',
  dark: 'border-slate-800 border-t-transparent',
}

const Spinner = ({ size = 'md', color = 'accent', className = '' }) => (
  <div
    className={`inline-block rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`}
    role="status"
    aria-label="Loading"
  />
)

export default Spinner
