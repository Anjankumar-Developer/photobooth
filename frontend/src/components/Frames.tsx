import { Square, LayoutTemplate, Film, Image as ImageIcon } from 'lucide-react';

const FRAMES = [
  { id: 'none', name: 'None', icon: <Square className="w-5 h-5" /> },
  { id: 'polaroid', name: 'Polaroid', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'film', name: 'Film Strip', icon: <Film className="w-5 h-5" /> },
  { id: 'classic', name: 'Classic', icon: <LayoutTemplate className="w-5 h-5" /> },
];

export default function Frames({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FRAMES.map(frame => (
        <button
          key={frame.id}
          onClick={() => onSelect(frame.id)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl border border-stone-200 bg-white hover:border-rose-300 transition-all hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 mb-2 border border-stone-200">
            {frame.icon}
          </div>
          <span className="text-sm font-medium text-stone-700">{frame.name}</span>
        </button>
      ))}
    </div>
  );
}
