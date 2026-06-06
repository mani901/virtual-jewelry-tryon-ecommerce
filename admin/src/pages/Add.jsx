import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import Spinner from '../components/ui/Spinner'

const MAX_IMAGES = 4

const ImageDropzone = ({ image, onDrop, onRemove, label, index }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => onDrop(files[0]),
    accept: { 'image/*': [] },
    multiple: false,
  })

  if (image) {
    return (
      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
        <img src={URL.createObjectURL(image)} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove image ${index + 1}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-600">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
        {index === 0 && (
          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white py-0.5">Primary</span>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2 ${
        isDragActive ? 'border-admin-accent bg-admin-accent-light' : 'border-gray-200 hover:border-admin-accent hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-300 mb-1">
        <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
      </svg>
      <span className="text-[10px] text-gray-400 leading-tight">{index === 0 ? 'Primary' : label}</span>
    </div>
  )
}

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Earrings')
  const [subCategory, setSubCategory] = useState('Gold')
  const [bestseller, setBestseller] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const setImage = useCallback((idx, file) => {
    setImages(prev => prev.map((img, i) => i === idx ? file : img))
  }, [])

  const removeImage = useCallback((idx) => {
    setImages(prev => prev.map((img, i) => i === idx ? null : img))
  }, [])

  const validate = () => {
    const e = {}
    if (!name.trim() || name.trim().length < 3) e.name = 'Name must be at least 3 characters'
    if (!description.trim() || description.trim().length < 20) e.description = 'Description must be at least 20 characters'
    if (!price || Number(price) <= 0) e.price = 'Enter a valid price greater than 0'
    return e
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify([]))
      images.forEach((img, i) => { if (img) formData.append(`image${i + 1}`, img) })

      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } })
      if (response.data.success) {
        toast.success('Product added successfully!')
        setName(''); setDescription(''); setPrice('')
        setImages([null, null, null, null])
        setBestseller(false)
        setErrors({})
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Failed to add product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-admin-accent'}`

  return (
    <form onSubmit={onSubmitHandler} noValidate className="max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Add New Jewellery</h2>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Images</h3>
        <div className="flex gap-3 flex-wrap">
          {images.map((img, i) => (
            <ImageDropzone
              key={i}
              index={i}
              image={img}
              label={`Image ${i + 1}`}
              onDrop={file => setImage(i, file)}
              onRemove={() => removeImage(i)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Upload up to 4 images. The first image is the primary display image.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Product Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-name">Product Name</label>
          <input
            id="product-name"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            onBlur={() => { if (!name.trim() || name.trim().length < 3) setErrors(p => ({ ...p, name: 'Name must be at least 3 characters' })) }}
            className={fieldClass('name')}
            placeholder="e.g. 22K Gold Layered Chain Necklace"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-desc">Description</label>
          <textarea
            id="product-desc"
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
            onBlur={() => { if (!description.trim() || description.trim().length < 20) setErrors(p => ({ ...p, description: 'Description must be at least 20 characters' })) }}
            className={`${fieldClass('description')} resize-none`}
            rows={4}
            placeholder="Describe the material, design, and occasion…"
          />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
            <span className={`text-xs ${description.length < 20 ? 'text-gray-300' : 'text-gray-400'}`}>{description.length} chars</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Category & Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-cat">Category</label>
            <select id="product-cat" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-admin-accent">
              {['Earrings', 'Glasses', 'Nose Rings', 'Headpieces'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-mat">Material</label>
            <select id="product-mat" value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-admin-accent">
              {['Gold', 'Silver', 'Diamond', 'Pearl', 'Gemstone'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-price">Price (₨)</label>
            <input
              id="product-price"
              type="number"
              value={price}
              onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })) }}
              onBlur={() => { if (!price || Number(price) <= 0) setErrors(p => ({ ...p, price: 'Enter a valid price' })) }}
              className={fieldClass('price')}
              placeholder="25000"
              min="1"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Mark as Bestseller</p>
            <p className="text-xs text-gray-400">Bestsellers are featured prominently in the store</p>
          </div>
          <button
            type="button"
            onClick={() => setBestseller(p => !p)}
            className={`relative w-11 h-6 rounded-full transition-colors ${bestseller ? 'bg-admin-accent' : 'bg-gray-200'}`}
            aria-checked={bestseller}
            role="switch"
            aria-label="Mark as bestseller"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${bestseller ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 bg-admin-sidebar text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Spinner size="sm" color="white" />}
        {loading ? 'Adding Product…' : 'Add Product'}
      </button>
    </form>
  )
}

export default Add
