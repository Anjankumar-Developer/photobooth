import React, { useState } from 'react';
import { Sparkles, Sun, Moon, Droplets, Camera as CameraIcon, SlidersHorizontal } from 'lucide-react';

const FILTERS = [
  { id: 'normal', name: 'Normal', icon: <CameraIcon className="w-5 h-5" />, color: 'bg-stone-100' },
  { id: 'vintage', name: 'Vintage', icon: <Sun className="w-5 h-5" />, color: 'bg-amber-100/50' },
  { id: 'sepia', name: 'Sepia', icon: <Droplets className="w-5 h-5" />, color: 'bg-orange-100/50' },
  { id: 'bw', name: 'B & W', icon: <Moon className="w-5 h-5" />, color: 'bg-stone-200/50' },
  { id: 'pastel', name: 'Pastel', icon: <Sparkles className="w-5 h-5" />, color: 'bg-pink-100/50' },
];

interface FiltersProps {
  onSelect: (id: string) => void;
  onAdjust: (type: 'brightness' | 'contrast', value: number) => void;
}

export default function Filters({ onSelect, onAdjust }: FiltersProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const handleBrightness = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBrightness(val);
    onAdjust('brightness', val);
  };

  const handleContrast = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setContrast(val);
    onAdjust('contrast', val);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-stone-100 hover:border-rose-200 transition-all hover:shadow-sm ${filter.color}`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-600 mb-2 shadow-sm">
              {filter.icon}
            </div>
            <span className="text-sm font-medium text-stone-700">{filter.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-stone-500" />
          <h3 className="text-sm font-medium text-stone-700">Adjustments</h3>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-stone-500 font-medium">
            <span>Brightness</span>
            <span>{Math.round(brightness * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="-0.5" max="0.5" step="0.05" 
            value={brightness} 
            onChange={handleBrightness}
            className="w-full accent-rose-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-stone-500 font-medium">
            <span>Contrast</span>
            <span>{Math.round(contrast * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="-0.5" max="0.5" step="0.05" 
            value={contrast} 
            onChange={handleContrast}
            className="w-full accent-rose-400"
          />
        </div>
      </div>
    </div>
  );
}
