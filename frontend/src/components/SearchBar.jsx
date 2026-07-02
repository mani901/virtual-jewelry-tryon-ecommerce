import React, { useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const SpeechRecognitionAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined;

const MicIcon = ({ listening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${listening ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
        <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
    </svg>
)

const SearchBar = () => {
    const {search,setSearch,showSearch,setShowSearch}=useContext(ShopContext);
    const [visible,setVisible] =useState(false)
    const [listening, setListening] = useState(false)
    const recognitionRef = useRef(null)
    const location=useLocation();
    useEffect(()=>{
       if(location.pathname.includes('collection')){
           setVisible(true);
       }
       else{
          setVisible(false);
       }


    },[location])

    useEffect(() => {
        return () => recognitionRef.current?.stop()
    }, [])

    const handleVoiceSearch = () => {
        if (!SpeechRecognitionAPI) {
            toast.error('Voice search is not supported in this browser')
            return
        }
        if (listening) {
            recognitionRef.current?.stop()
            return
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => setListening(true)
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSearch(transcript)
        }
        recognition.onerror = (event) => {
            if (event.error !== 'aborted') {
                toast.error('Could not hear you. Please try again.')
            }
        }
        recognition.onend = () => setListening(false)

        recognitionRef.current = recognition
        recognition.start()
    }

  return showSearch  && visible ?(
    <div className='border-t border-b bg-gray-50 text-center'>
        <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm'type="text" placeholder={listening ? 'Listening...' : 'Search'} />
        {SpeechRecognitionAPI && (
            <button
                type="button"
                onClick={handleVoiceSearch}
                className="mx-2 shrink-0"
                aria-label={listening ? 'Stop voice search' : 'Search by voice'}
                title={listening ? 'Stop voice search' : 'Search by voice'}
            >
                <MicIcon listening={listening} />
            </button>
        )}
        <img className='w-4'src={assets.search_icon} alt="" />
        </div>
        <img onClick={()=>setShowSearch(false)} className='inline w-3 cursor-pointer'src={assets.cross_icon} alt="" />
    </div>
  ) : null
}

export default SearchBar