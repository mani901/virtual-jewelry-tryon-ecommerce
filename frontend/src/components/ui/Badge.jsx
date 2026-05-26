const variants = {
  bestseller: 'bg-jewelry-gold text-white',
  new: 'bg-jewelry-charcoal text-white',
  sale: 'bg-red-500 text-white',
}

const Badge = ({ variant = 'new', label, className = '' }) => (
  <span className={`inline-block text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 ${variants[variant]} ${className}`}>
    {label || variant}
  </span>
)

export default Badge
