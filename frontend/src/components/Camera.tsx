import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraProps {
  onCapture: (photoDataUrl: string) => void;
  photosCount: number;
}

export default function Camera({ onCapture, photosCount }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(3);
    
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        capture();
        setIsCounting(false);
      }
    }, 1000);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-stone-900 aspect-[4/3] flex items-center justify-center">
      {/* @ts-ignore - react-webcam types missing optional props */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode,
          aspectRatio: 4/3
        }}
        className="w-full h-full object-cover"
        mirrored={facingMode === 'user'}
      />
      
      {isCounting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.span 
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-8xl font-serif text-white font-bold drop-shadow-lg"
          >
            {countdown > 0 ? countdown : '📸'}
          </motion.span>
        </div>
      )}

      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
        <button
          onClick={toggleCamera}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
          title="Switch Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        
        <button
          onClick={startCountdown}
          disabled={isCounting}
          className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-lg">
            <CameraIcon className="w-6 h-6" />
          </div>
        </button>
        
        <div className="w-11" /> {/* Spacer for centering */}
      </div>
      
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium tracking-wider">
        {photosCount + 1} / 4
      </div>
    </div>
  );
}
