'use client';
import { useState, useRef, useEffect } from 'react';
import { BarcodeDetector } from 'barcode-detector/ponyfill';
import { Button } from '@/components/ui/button';

function WebcamBarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Unable to access the camera. Please grant permission.");
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        const image = new Image();
        image.src = imageUrl;
        image.onload = async () => {
          const barcodeDetector = new BarcodeDetector({
            formats: ["qr_code", "ean_13", "ean_8", "code_39", "code_128"],
          });
          try {
            const res = await barcodeDetector.detect(image);
            if (res && res.length > 0) {
              alert(`Detected barcode: ${res[0].rawValue}`);
            } else {
              setError("No barcode detected in the current frame.");
            }
          } catch (err) {
            setError("Error detecting barcode: " + err);
          }
        };
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-4">
      <video
        ref={videoRef}
        autoPlay
        className="w-full max-h-80"
        id="feed"
      />
      <Button onClick={captureFrame}>Capture Frame</Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default function BarcodeScanner() {

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [results, setResults] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  const startDetecting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      videoRef.current!.srcObject = stream

      
      const barcodeDetector = new BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_39', 'code_128']
      })

      try {
        if (videoRef.current && videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const res = await barcodeDetector.detect(videoRef.current);
          if (res && res.length > 0) {
            setResults(res[0].rawValue)
          }
        } else {
          throw new Error("Barcode detector not ready")
        }


      } catch (err) {
        setError("No result " + err)
      }

    } catch {
      setError("Grant camera permission ")

    }
  }

  useEffect(() => {
    if (videoRef.current) {
      startDetecting();
    }

  }, [])

  return (
    <main className='flex flex-col flex-1 min-h-screen w-full gap-y-4 items-center justify-center'>

      {/* <video
        ref={videoRef}
        autoPlay
        className='w-full max-h-80'
        id='feed'
      >
      </video> */}
      <WebcamBarcodeScanner/>

      <input
        type="file"
        accept="image/*"
        max={1}
        onChange={async (e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const file = files[0];
            const image = new Image();
            image.src = URL.createObjectURL(file);
            image.onload = async () => {
              const barcodeDetector = new BarcodeDetector({
                formats: ['qr_code', 'ean_13', 'ean_8', 'code_39', 'code_128']
              })
              try {
                const res = await barcodeDetector.detect(image);
                if (res && res.length > 0) {
                  setResults(res[0].rawValue)
                } else {
                  setError("No barcode detected")
                }
              } catch (err) {
                setError("Error detecting barcode " + err)
              }
            };
          }
        }}
        className="border p-2"
      />
      {results && <Button onClick={() => {
        alert(results)

      }}>Scanned</Button>}

      {error && <p className='text-red-500'>{error}</p>}

    </main>
  );
}