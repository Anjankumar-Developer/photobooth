import React, { useState, useRef, useEffect } from 'react';
import Camera from '../components/Camera';
import EditorCanvas, { EditorCanvasRef } from '../components/EditorCanvas';
import PhotoStrip from '../components/PhotoStrip';
import Filters from '../components/Filters';
import Frames from '../components/Frames';
import Stickers from '../components/Stickers';
import { Camera as CameraIcon, Download, Sparkles, Image as ImageIcon, Sticker, Type, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Booth() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'edit' | 'strip'>('camera');
  const [editMode, setEditMode] = useState<'filters' | 'frames' | 'stickers' | 'text'>('filters');
  const editorRef = useRef<EditorCanvasRef>(null);
  
  const handlePhotoCapture = (photoDataUrl: string) => {
    setPhotos(prev => [...prev, photoDataUrl]);
    setCurrentPhoto(photoDataUrl);
    setActiveTab('edit');
  };

  const handleFinishEditing = (editedPhotoUrl: string) => {
    // Update the last photo with the edited version
    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[newPhotos.length - 1] = editedPhotoUrl;
      return newPhotos;
    });
    
    if (photos.length >= 4) {
      setActiveTab('strip');
    } else {
      setActiveTab('camera');
    }
  };

  const resetBooth = () => {
    setPhotos([]);
    setCurrentPhoto(null);
    setActiveTab('camera');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col items-center min-h-screen">
      <header className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-serif italic font-medium tracking-tight text-stone-800">
            Aesthetic Booth
          </h1>
        </div>
        {photos.length > 0 && (
          <button 
            onClick={resetBooth}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 hover:bg-stone-300 transition-colors text-sm font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Start Over
          </button>
        )}
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'camera' && (
            <motion.div 
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h2 className="text-lg font-medium text-stone-700">Take a Photo</h2>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${i < photos.length ? 'bg-rose-400' : 'bg-stone-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <Camera onCapture={handlePhotoCapture} photosCount={photos.length} />
              </div>
            </motion.div>
          )}

          {activeTab === 'edit' && currentPhoto && (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6"
            >
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center">
                <EditorCanvas 
                  ref={editorRef}
                  photoUrl={currentPhoto} 
                  onSave={handleFinishEditing}
                  editMode={editMode}
                />
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col gap-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <TabButton active={editMode === 'filters'} onClick={() => setEditMode('filters')} icon={<Sparkles className="w-4 h-4" />} label="Filters" />
                  <TabButton active={editMode === 'frames'} onClick={() => setEditMode('frames')} icon={<ImageIcon className="w-4 h-4" />} label="Frames" />
                  <TabButton active={editMode === 'stickers'} onClick={() => setEditMode('stickers')} icon={<Sticker className="w-4 h-4" />} label="Stickers" />
                  <TabButton active={editMode === 'text'} onClick={() => setEditMode('text')} icon={<Type className="w-4 h-4" />} label="Text" />
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {editMode === 'filters' && (
                    <Filters 
                      onSelect={(id) => editorRef.current?.applyFilter(id)} 
                      onAdjust={(type, val) => editorRef.current?.updateImageSettings({ [type]: val })}
                    />
                  )}
                  {editMode === 'frames' && <Frames onSelect={(id) => editorRef.current?.applyFrame(id)} />}
                  {editMode === 'stickers' && <Stickers onSelect={(emoji) => editorRef.current?.addSticker(emoji)} />}
                  {editMode === 'text' && (
                    <div className="text-sm text-stone-500 italic text-center mt-8">
                      Click "Add Text" on the canvas to add custom text.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'strip' && (
            <motion.div 
              key="strip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <PhotoStrip photos={photos} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-rose-100 text-rose-700' 
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
