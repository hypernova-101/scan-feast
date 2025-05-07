'use client';
import { useState, useRef, useEffect } from 'react';
import { BarcodeDetector } from 'barcode-detector/ponyfill';
import { Button } from '@/components/ui/button';

export default function BarcodeScanner() {
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [results, setResults] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  const startDetecting = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {facingMode: "environment"},
        })

        videoRef.current!.srcObject = stream

        const barcodeDetector = new BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_39', 'code_128']
        })

        try {
          const res = await barcodeDetector.detect(videoRef.current!)

          if(res && res.length > 0) {
            setResults(res[0].rawValue)
          }
        } catch(err) {
          setError("No result "+err)
        }
        
      } catch {
        setError("Grant camera permission ")

      }
  }

  useEffect(() => {
    if(videoRef.current) {
      startDetecting();
    }

  }, [])

  return (
    <main className='flex flex-col flex-1 min-h-screen w-full gap-y-4 items-center justify-center'>
      
      <video 
        ref={videoRef}
        autoPlay 
        className='w-full max-h-80'
      >
      </video>

      { results && <Button onClick={() => {
        alert(results)

      }}>Scanned</Button>} 

      { error && <p className='text-red-500'>{error}</p>}

    </main>
  );
}