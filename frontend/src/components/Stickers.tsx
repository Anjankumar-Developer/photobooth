const STICKERS = [
  { id: 'sparkles', emoji: '✨', name: 'Sparkles' },
  { id: 'heart', emoji: '💖', name: 'Heart' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'flower', emoji: '🌸', name: 'Flower' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
  { id: 'ribbon', emoji: '🎀', name: 'Ribbon' },
  { id: 'cherry', emoji: '🍒', name: 'Cherry' },
  { id: 'cloud', emoji: '☁️', name: 'Cloud' },
  { id: 'moon', emoji: '🌙', name: 'Moon' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
];

export default function Stickers({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STICKERS.map(sticker => (
        <button
          key={sticker.id}
          onClick={() => onSelect(sticker.emoji)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-100 hover:border-rose-200 hover:bg-rose-50 transition-all hover:shadow-sm"
          title={sticker.name}
        >
          <span className="text-3xl mb-1">{sticker.emoji}</span>
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">{sticker.name}</span>
        </button>
      ))}
    </div>
  );
}
