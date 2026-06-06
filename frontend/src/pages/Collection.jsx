import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem, { ProductItemSkeleton } from '../components/ProductItem'
import EmptyState from '../components/ui/EmptyState'

const CATEGORIES = ['Earrings', 'Glasses', 'Nose Rings', 'Headpieces']
const MATERIALS = ['Gold', 'Silver', 'Diamond', 'Pearl', 'Gemstone']

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext)
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [subcategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')

  const toggleCategory = (value) => {
    setCategory(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value])
  }

  const toggleSubCategory = (value) => {
    setSubCategory(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value])
  }

  const clearFilters = () => {
    setCategory([])
    setSubCategory([])
    setSortType('relevant')
  }

  const activeFilterCount = category.length + subcategory.length

  const applyFilter = () => {
    let productsCopy = [...products]
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    if (subcategory.length > 0) {
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subCategory))
    }
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    const fpCopy = filterProducts.slice()
    switch (sortType) {
      case 'low-high': setFilterProducts(fpCopy.sort((a, b) => a.price - b.price)); break
      case 'high-low': setFilterProducts(fpCopy.sort((a, b) => b.price - a.price)); break
      default: applyFilter(); break
    }
  }

  useEffect(() => { applyFilter() }, [category, subcategory, search, showSearch, products])
  useEffect(() => { sortProduct() }, [sortType])

  const latestIds = products.slice(0, 10).map(p => p._id)

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 border-t">
      {/* Filter Panel */}
      <div className="min-w-60">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2 w-full sm:w-auto"
          aria-expanded={showFilter}
          aria-controls="filter-panel"
        >
          <span>FILTERS</span>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-jewelry-charcoal text-white rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {activeFilterCount}
            </span>
          )}
          <img
            className={`h-3 sm:hidden ml-auto transition-transform ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=""
            aria-hidden="true"
          />
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-jewelry-gold hover:underline mb-2 block"
          >
            Clear all filters
          </button>
        )}

        <div id="filter-panel" className={`${showFilter ? '' : 'hidden'} sm:block`}>
          <div className="border border-gray-200 pl-5 py-3 my-5">
            <p className="mb-3 text-sm font-medium text-jewelry-charcoal">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {CATEGORIES.map(label => (
                <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-jewelry-charcoal">
                  <input
                    type="checkbox"
                    value={label}
                    checked={category.includes(label)}
                    onChange={() => toggleCategory(label)}
                    className="w-3.5 h-3.5 accent-jewelry-charcoal"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 pl-5 py-3 mt-6">
            <p className="mb-3 text-sm font-medium text-jewelry-charcoal">MATERIAL</p>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {MATERIALS.map(label => (
                <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-jewelry-charcoal">
                  <input
                    type="checkbox"
                    value={label}
                    checked={subcategory.includes(label)}
                    onChange={() => toggleSubCategory(label)}
                    className="w-3.5 h-3.5 accent-jewelry-charcoal"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <Title text1="ALL" text2="COLLECTIONS" />
          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className="border border-gray-200 text-sm px-3 py-2 outline-none focus:border-jewelry-charcoal"
          >
            <option value="relevant">Sort: Relevant</option>
            <option value="low-high">Sort: Low to High</option>
            <option value="high-low">Sort: High to Low</option>
          </select>
        </div>

        {/* Active filter pills */}
        {(category.length > 0 || subcategory.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {category.map(c => (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className="flex items-center gap-1 text-xs bg-jewelry-blush text-jewelry-charcoal px-2.5 py-1 rounded-full hover:bg-jewelry-gold hover:text-white transition-colors"
              >
                {c}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
              </button>
            ))}
            {subcategory.map(s => (
              <button
                key={s}
                onClick={() => toggleSubCategory(s)}
                className="flex items-center gap-1 text-xs bg-jewelry-blush text-jewelry-charcoal px-2.5 py-1 rounded-full hover:bg-jewelry-gold hover:text-white transition-colors"
              >
                {s}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
          {products.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => <ProductItemSkeleton key={i} />)
          ) : filterProducts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="search"
                title="No jewellery found"
                subtitle="Try removing some filters or browse all collections"
                cta={{ label: 'Clear Filters', onClick: clearFilters }}
              />
            </div>
          ) : (
            filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
                bestseller={item.bestseller}
                isNew={latestIds.includes(item._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Collection
