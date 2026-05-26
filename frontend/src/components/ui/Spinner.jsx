const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

const colors = {
  gold: 'border-jewelry-gold border-t-transparent',
  white: 'border-white border-t-transparent',
  dark: 'border-jewelry-charcoal border-t-transparent',
}

const Spinner = ({ size = 'md', color = 'gold', className = '' }) => (
  <div
    className={`inline-block rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`}
    role="status"
    aria-label="Loading"
  />
)

export default Spinner
