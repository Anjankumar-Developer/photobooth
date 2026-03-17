import { Download, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '../api';

interface PhotoStripProps {
  photos: string[];
}

export default function PhotoStrip({ photos }: PhotoStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await api.generatePhotoStrip(photos);
      
      // Create a canvas to merge photos
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 40;
      const photoWidth = 600;
      const photoHeight = 800;
      const spacing = 20;
      const headerHeight = 80;
      const footerHeight = 60;

      canvas.width = photoWidth + (padding * 2);
      canvas.height = headerHeight + (photoHeight * 4) + (spacing * 3) + footerHeight + (padding * 2);

      // Draw background
      ctx.fillStyle = '#f8f5f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw header text
      ctx.fillStyle = '#57534e'; // stone-600
      ctx.font = 'italic 500 32px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aesthetic Booth', canvas.width / 2, padding + 40);

      // Draw photos
      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = photos[i];
        });
        
        const y = padding + headerHeight + (i * (photoHeight + spacing));
        
        // Draw border/shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#e7e5e4'; // stone-200
        ctx.fillRect(padding, y, photoWidth, photoHeight);
        
        // Draw image
        ctx.shadowColor = 'transparent';
        ctx.drawImage(img, padding, y, photoWidth, photoHeight);
      }

      // Draw footer text
      ctx.fillStyle = '#a8a29e'; // stone-400
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - padding - 20);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `aesthetic-booth-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Failed to generate strip', error);
      alert('Failed to download photo strip.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
      <div 
        ref={stripRef}
        className="bg-[#f8f5f2] p-4 pb-12 rounded-sm shadow-xl border border-stone-200 w-full flex flex-col gap-4 relative"
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        {/* Strip Header */}
        <div className="flex justify-center items-center gap-2 py-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span className="font-serif italic text-stone-600 font-medium tracking-wide">Aesthetic Booth</span>
          <Sparkles className="w-4 h-4 text-rose-400" />
        </div>

        {/* Photos */}
        {photos.map((photo, index) => (
          <div key={index} className="w-full aspect-[4/3] bg-stone-200 rounded overflow-hidden shadow-inner border border-stone-300/50">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {/* Empty slots if less than 4 photos */}
        {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, index) => (
          <div key={`empty-${index}`} className="w-full aspect-[4/3] bg-stone-200/50 rounded overflow-hidden shadow-inner border border-stone-300/50 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-stone-300/50 animate-pulse" />
          </div>
        ))}

        {/* Date / Footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="font-mono text-xs text-stone-400 tracking-widest uppercase">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isGenerating || photos.length === 0}
        className="flex items-center gap-2 px-8 py-4 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:hover:bg-rose-500 w-full justify-center text-lg"
      >
        {isGenerating ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Download className="w-6 h-6" />
        )}
        {isGenerating ? 'Generating...' : 'Download Strip'}
      </button>
    </div>
  );
}
