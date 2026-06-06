import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const AI_MODEL_URL = import.meta.env.VITE_AI_MODEL_URL || 'http://localhost:8000'

const CATEGORY_JEWELRY_MAP = {
  Earrings: 'earrings',
  Glasses: 'glasses',
  'Nose Rings': 'nose_ring',
  Headpieces: 'headpiece',
}

const FACE_SHAPE_DESCRIPTIONS = {
  oval: 'Balanced proportions — considered the most versatile face shape.',
  round: 'Soft curves with similar width and length — full cheeks.',
  square: 'Strong jawline with equal width across forehead and jaw.',
  heart: 'Wider forehead tapering to a narrow chin.',
  diamond: 'Narrow forehead and jaw with wide cheekbones.',
  oblong: 'Longer than wide with a straight cheek line.',
}

const FACE_SHAPE_RECS = {
  oval:    { earrings: ['Drop', 'Chandelier', 'Hoops'], glasses: ['Cat Eye', 'Aviator', 'Round'], nose_ring: ['Simple Stud', 'Hoop'], headpiece: ['Tiara', 'Crown'] },
  round:   { earrings: ['Chandelier', 'Drop', 'Linear'], glasses: ['Rectangular', 'Square', 'Cat Eye'], nose_ring: ['Simple Stud', 'Hoop'], headpiece: ['Tiara'] },
  square:  { earrings: ['Hoops', 'Chandelier', 'Drop'], glasses: ['Round', 'Oval', 'Adventurous'], nose_ring: ['Hoop', 'Stud'], headpiece: ['Crown'] },
  heart:   { earrings: ['Stud', 'Drop', 'Shoulder Duster'], glasses: ['Round', 'Bottom Heavy'], nose_ring: ['Stud', 'Thin Hoop'], headpiece: ['Delicate Crown'] },
  diamond: { earrings: ['Stud', 'Hoop', 'Drop'], glasses: ['Oval', 'Cat Eye'], nose_ring: ['Stud'], headpiece: ['Tiara'] },
  oblong:  { earrings: ['Stud', 'Chandelier', 'Shoulder Duster'], glasses: ['Cat Eye', 'Clubmaster'], nose_ring: ['Hoop', 'Stud'], headpiece: ['Headband', 'Crown'] },
}

const JEWELRY_TYPE_LABELS = {
  earrings: 'Earrings',
  headpiece: 'Headpiece',
  nose_ring: 'Nose Ring',
  glasses: 'Glasses',
}

export default function VirtualTryOn({ isOpen, onClose, product }) {
  const [step, setStep] = useState('capture') // 'capture' | 'processing' | 'result' | 'error'
  const [inputMode, setInputMode] = useState('camera') // 'camera' | 'upload'
  const [capturedFile, setCapturedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [cameraError, setCameraError] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const jewelryType = CATEGORY_JEWELRY_MAP[product?.category] ?? 'earrings'

  // Start camera when in camera mode on capture step
  useEffect(() => {
    if (!isOpen || step !== 'capture' || inputMode !== 'camera') return
    startCamera()
    return () => stopCamera()
  }, [isOpen, step, inputMode])

  // Stop camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      resetState()
    }
  }, [isOpen])

  function startCamera() {
    setCameraError(false)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => {
        setCameraError(true)
        setInputMode('upload')
      })
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  function resetState() {
    setStep('capture')
    setInputMode('camera')
    setCapturedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setErrorMsg('')
    setCameraError(false)
  }

  function captureFromCamera() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(blob => {
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      setCapturedFile(file)
      setPreviewUrl(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setCapturedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleTryOn() {
    if (!capturedFile) return
    setStep('processing')

    try {
      // Pick the jewelry file that matches this product's image.
      // Seed names files "{type}-{n}.ext" (1-based), so we extract n and
      // select files[n-1] from the AI model's sorted list for this type.
      let jewelryFilename = ''
      try {
        const listRes = await axios.get(`${AI_MODEL_URL}/jewelry`)
        const files = listRes.data[jewelryType] ?? []
        const imgUrl = product?.image?.[0] ?? ''
        const match = imgUrl.match(/-(\d+)\.[^.]+$/)
        const idx = match ? parseInt(match[1], 10) - 1 : 0
        jewelryFilename = files[Math.min(idx, files.length - 1)]?.filename ?? files[0]?.filename ?? ''
      } catch {
        // If listing fails, backend will auto-select; continue without it
      }

      const formData = new FormData()
      formData.append('file', capturedFile)
      formData.append('jewelry_type', jewelryType)
      if (jewelryFilename) formData.append('jewelry_filename', jewelryFilename)

      const res = await axios.post(`${AI_MODEL_URL}/try-on`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success) {
        setResult(res.data)
        setStep('result')
      } else {
        setErrorMsg('Could not process your image. Please try again.')
        setStep('error')
      }
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (detail.toLowerCase().includes('no face')) {
        setErrorMsg('No face detected. Please ensure your face is clearly visible with good lighting.')
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setErrorMsg('Virtual Try On is temporarily unavailable. Please try again later.')
      } else {
        setErrorMsg(detail || 'Something went wrong. Please try again.')
      }
      setStep('error')
    }
  }

  function handleRetry() {
    setPreviewUrl(null)
    setCapturedFile(null)
    setResult(null)
    setErrorMsg('')
    setStep('capture')
    setInputMode('camera')
  }

  if (!isOpen) return null

  const faceShape = result?.face_shape
  const recs = faceShape ? FACE_SHAPE_RECS[faceShape]?.[jewelryType] ?? [] : []
  const resultImageUrl = result ? `${AI_MODEL_URL}${result.download_url}` : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && step !== 'processing') onClose() }}
    >
      <div className="relative bg-jewelry-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-prata text-lg text-jewelry-charcoal">Virtual Try On</h2>
            <p className="text-xs text-jewelry-stone mt-0.5">{product?.name}</p>
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="text-jewelry-stone hover:text-jewelry-charcoal transition-colors p-1"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Step: CAPTURE ─────────────────────────────────── */}
        {step === 'capture' && (
          <div className="p-6">
            {/* Jewelry type badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-jewelry-stone">Trying on:</span>
              <span className="px-2.5 py-0.5 bg-jewelry-blush text-jewelry-gold text-xs font-medium rounded-full">
                {JEWELRY_TYPE_LABELS[jewelryType]}
              </span>
            </div>

            {/* Camera error notice */}
            {cameraError && (
              <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-700">
                Camera access was denied — switched to file upload.
              </div>
            )}

            {/* Input mode tabs */}
            <div className="flex border-b border-gray-100 mb-5">
              {['camera', 'upload'].map(mode => (
                <button
                  key={mode}
                  onClick={() => { setInputMode(mode); setCapturedFile(null); setPreviewUrl(null) }}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                    inputMode === mode
                      ? 'border-b-2 border-jewelry-gold text-jewelry-gold'
                      : 'text-jewelry-stone hover:text-jewelry-charcoal'
                  }`}
                >
                  {mode === 'camera' ? 'Use Camera' : 'Upload Photo'}
                </button>
              ))}
            </div>

            {/* Camera mode */}
            {inputMode === 'camera' && (
              <div className="flex flex-col items-center gap-4">
                {!previewUrl ? (
                  <>
                    <div className="w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-sm overflow-hidden relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <div className="absolute inset-0 border-2 border-jewelry-gold/30 rounded-sm pointer-events-none" />
                    </div>
                    <button
                      onClick={captureFromCamera}
                      className="w-14 h-14 rounded-full bg-jewelry-gold hover:bg-jewelry-gold-dark transition-colors flex items-center justify-center shadow-lg"
                      aria-label="Capture photo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p className="text-xs text-jewelry-stone">Position your face in the frame and click the button</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-full max-w-sm aspect-[3/4] rounded-sm overflow-hidden">
                      <img src={previewUrl} alt="Captured" className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                    <button
                      onClick={() => { setPreviewUrl(null); setCapturedFile(null); startCamera() }}
                      className="text-xs text-jewelry-stone underline underline-offset-2 hover:text-jewelry-charcoal"
                    >
                      Retake photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload mode */}
            {inputMode === 'upload' && (
              <div className="flex flex-col items-center gap-4">
                {!previewUrl ? (
                  <div
                    className="w-full border-2 border-dashed border-jewelry-gold/40 rounded-sm p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-jewelry-gold transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-jewelry-gold/60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-jewelry-charcoal font-medium">Drop your photo here</p>
                    <p className="text-xs text-jewelry-stone">or click to browse</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-full max-w-sm aspect-[3/4] rounded-sm overflow-hidden">
                      <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => { setPreviewUrl(null); setCapturedFile(null) }}
                      className="text-xs text-jewelry-stone underline underline-offset-2 hover:text-jewelry-charcoal"
                    >
                      Choose different photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            {capturedFile && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleTryOn}
                  className="bg-jewelry-charcoal text-white px-10 py-3 text-sm hover:bg-jewelry-gold transition-colors duration-200"
                >
                  Analyze & Try On
                </button>
              </div>
            )}

            {/* Hidden canvas for camera capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* ── Step: PROCESSING ──────────────────────────────── */}
        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-2 border-jewelry-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-prata text-jewelry-charcoal text-lg">Analyzing your face…</p>
            <p className="text-xs text-jewelry-stone text-center max-w-xs">
              Our AI is detecting your face shape and placing the perfect {JEWELRY_TYPE_LABELS[jewelryType].toLowerCase()} overlay.
            </p>
          </div>
        )}

        {/* ── Step: RESULT ──────────────────────────────────── */}
        {step === 'result' && result && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Result image */}
              <div className="sm:w-1/2 flex-shrink-0">
                <div className="aspect-[3/4] rounded-sm overflow-hidden bg-jewelry-blush">
                  <img
                    src={resultImageUrl}
                    alt="Virtual try-on result"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              </div>

              {/* Info panel */}
              <div className="sm:w-1/2 flex flex-col justify-between gap-5">
                <div className="space-y-5">
                  {/* Face shape */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-jewelry-stone mb-1">Face Shape Detected</p>
                    <p className="font-prata text-2xl text-jewelry-charcoal capitalize">{faceShape}</p>
                    <p className="text-xs text-jewelry-stone mt-1 leading-relaxed">
                      {FACE_SHAPE_DESCRIPTIONS[faceShape] ?? ''}
                    </p>
                  </div>

                  {/* Recommended styles */}
                  {recs.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-jewelry-stone mb-2">
                        Recommended {JEWELRY_TYPE_LABELS[jewelryType]} Styles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recs.map(style => (
                          <span
                            key={style}
                            className="px-3 py-1 bg-jewelry-blush text-jewelry-charcoal text-xs rounded-full border border-jewelry-gold/20"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tip */}
                  <div className="text-xs text-jewelry-stone leading-relaxed bg-white/60 rounded-sm px-3 py-2.5 border border-gray-100">
                    <span className="text-jewelry-gold font-medium">Tip:</span> Try browsing our{' '}
                    <span className="font-medium text-jewelry-charcoal">{product?.category}</span> collection for pieces
                    that complement your {faceShape} face shape.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRetry}
                    className="w-full border border-jewelry-charcoal text-jewelry-charcoal py-2.5 text-sm hover:bg-jewelry-charcoal hover:text-white transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-jewelry-gold text-white py-2.5 text-sm hover:bg-jewelry-gold-dark transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: ERROR ───────────────────────────────────── */}
        {step === 'error' && (
          <div className="p-10 flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full bg-jewelry-blush flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-jewelry-gold">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-prata text-jewelry-charcoal text-lg mb-1">Unable to Process</p>
              <p className="text-sm text-jewelry-stone max-w-xs leading-relaxed">{errorMsg}</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-jewelry-charcoal text-white px-8 py-2.5 text-sm hover:bg-jewelry-gold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
