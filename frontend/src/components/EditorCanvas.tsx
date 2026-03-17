import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';
import { Download, Check, Type, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../api';

export interface EditorCanvasRef {
  addText: () => void;
  addSticker: (emoji: string) => void;
  applyFilter: (filterId: string) => void;
  applyFrame: (frameId: string) => void;
  updateImageSettings: (settings: { filterId?: string; brightness?: number; contrast?: number }) => void;
}

interface EditorCanvasProps {
  photoUrl: string;
  onSave: (editedPhotoUrl: string) => void;
  editMode: 'filters' | 'frames' | 'stickers' | 'text';
}

const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(({ photoUrl, onSave, editMode }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const settingsRef = useRef({ filterId: 'normal', brightness: 0, contrast: 0 });

  useImperativeHandle(ref, () => ({
    addText,
    addSticker,
    applyFilter,
    applyFrame,
    updateImageSettings
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = async () => {
      const canvas = new fabric.Canvas(canvasRef.current!, {
        width: 600,
        height: 800,
        backgroundColor: '#f5f5f4',
      });
      fabricRef.current = canvas;

      canvas.on('selection:created', (e) => setActiveObject(e.selected[0]));
      canvas.on('selection:updated', (e) => setActiveObject(e.selected[0]));
      canvas.on('selection:cleared', () => setActiveObject(null));

      try {
        const img = await fabric.Image.fromURL(photoUrl);
        
        // Scale image to fit canvas width
        const scale = 600 / img.width!;
        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: 300,
          top: 400,
          selectable: false,
          evented: false,
        });
        
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();
      } catch (err) {
        console.error('Failed to load image into canvas', err);
      }
    };

    initCanvas();

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
    };
  }, [photoUrl]);

  const handleSave = async () => {
    if (!fabricRef.current) return;
    setIsSaving(true);
    
    // Deselect active objects before saving
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    
    const dataUrl = fabricRef.current.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1
    });
    
    // Mock API call
    try {
      await api.uploadPhoto(dataUrl);
      onSave(dataUrl);
    } catch (err) {
      console.error('Save failed', err);
      onSave(dataUrl); // Fallback to local
    } finally {
      setIsSaving(false);
    }
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText('Double click to edit', {
      left: 300,
      top: 400,
      fontFamily: 'Inter, sans-serif',
      fill: '#1c1917',
      fontSize: 40,
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
      shadow: new fabric.Shadow({
        color: 'rgba(255,255,255,0.8)',
        blur: 4,
        offsetX: 2,
        offsetY: 2
      }),
      transparentCorners: false,
      cornerColor: '#f43f5e',
      cornerStyle: 'circle',
      borderColor: '#f43f5e',
      cornerSize: 12,
      padding: 10,
    });
    
    text.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    });

    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addSticker = (emoji: string) => {
    if (!fabricRef.current) return;
    const text = new fabric.Text(emoji, {
      left: 300,
      top: 400,
      fontSize: 80,
      originX: 'center',
      originY: 'center',
      transparentCorners: false,
      cornerColor: '#f43f5e',
      cornerStyle: 'circle',
      borderColor: '#f43f5e',
      cornerSize: 12,
      padding: 10,
      lockScalingFlip: true,
    });
    
    // Disable non-uniform scaling for stickers so they don't get squished
    text.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    });

    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const updateImageSettings = (settings: { filterId?: string; brightness?: number; contrast?: number }) => {
    settingsRef.current = { ...settingsRef.current, ...settings };
    applyFiltersToImage();
  };

  const applyFiltersToImage = () => {
    if (!fabricRef.current) return;
    
    const canvas = fabricRef.current;
    const objects = canvas.getObjects();
    const img = objects.find(obj => obj.type === 'image') as fabric.Image;
    
    if (!img) return;

    img.filters = [];
    const { filterId, brightness, contrast } = settingsRef.current;

    switch (filterId) {
      case 'vintage':
        img.filters.push(new fabric.filters.Sepia());
        img.filters.push(new fabric.filters.Noise({ noise: 40 }));
        break;
      case 'sepia':
        img.filters.push(new fabric.filters.Sepia());
        break;
      case 'bw':
        img.filters.push(new fabric.filters.Grayscale());
        break;
      case 'pastel':
        img.filters.push(new fabric.filters.Brightness({ brightness: 0.1 }));
        img.filters.push(new fabric.filters.Contrast({ contrast: -0.1 }));
        img.filters.push(new fabric.filters.Saturation({ saturation: -0.2 }));
        break;
      case 'normal':
      default:
        break;
    }

    if (brightness !== 0) {
      img.filters.push(new fabric.filters.Brightness({ brightness }));
    }
    
    if (contrast !== 0) {
      img.filters.push(new fabric.filters.Contrast({ contrast }));
    }

    img.applyFilters();
    canvas.renderAll();
  };

  const applyFilter = async (filterId: string) => {
    updateImageSettings({ filterId });

    // Mock API call for filter
    try {
      await api.applyFilter(photoUrl, filterId);
    } catch (err) {
      console.error('Filter failed', err);
    }
  };

  const applyFrame = async (frameId: string) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // Remove existing frames
    const existingFrames = canvas.getObjects().filter(obj => obj.name === 'frame');
    existingFrames.forEach(frame => canvas.remove(frame));

    let frameObj: fabric.Object | null = null;

    if (frameId === 'polaroid') {
      frameObj = new fabric.Rect({
        width: 560,
        height: 680,
        left: 300,
        top: 360,
        originX: 'center',
        originY: 'center',
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: 40,
        selectable: false,
        evented: false,
        name: 'frame',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.2)',
          blur: 10,
          offsetX: 0,
          offsetY: 5
        })
      });
      
      // Add polaroid bottom text area
      const bottomRect = new fabric.Rect({
        width: 600,
        height: 120,
        left: 300,
        top: 740,
        originX: 'center',
        originY: 'center',
        fill: 'white',
        selectable: false,
        evented: false,
        name: 'frame'
      });
      
      canvas.add(bottomRect);
    } else if (frameId === 'film') {
      frameObj = new fabric.Rect({
        width: 580,
        height: 780,
        left: 300,
        top: 400,
        originX: 'center',
        originY: 'center',
        fill: 'transparent',
        stroke: '#1c1917',
        strokeWidth: 20,
        strokeDashArray: [20, 10],
        selectable: false,
        evented: false,
        name: 'frame'
      });
    } else if (frameId === 'classic') {
      frameObj = new fabric.Rect({
        width: 560,
        height: 760,
        left: 300,
        top: 400,
        originX: 'center',
        originY: 'center',
        fill: 'transparent',
        stroke: '#f43f5e', // rose-500
        strokeWidth: 10,
        selectable: false,
        evented: false,
        name: 'frame'
      });
    }

    if (frameObj) {
      canvas.add(frameObj);
    }
    
    canvas.renderAll();

    // Mock API call for frame
    try {
      await api.addFrame(photoUrl, frameId);
    } catch (err) {
      console.error('Frame failed', err);
    }
  };

  const deleteActiveObject = () => {
    if (!fabricRef.current || !activeObject) return;
    fabricRef.current.remove(activeObject);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-stone-100">
        <canvas ref={canvasRef} className="max-w-full h-auto" style={{ width: 600, height: 800 }} />
        
        {editMode === 'text' && (
          <button 
            onClick={addText}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-white transition-colors flex items-center gap-2"
          >
            <Type className="w-4 h-4" /> Add Text
          </button>
        )}

        {activeObject && (
          <button 
            onClick={deleteActiveObject}
            className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-md text-white p-2 rounded-full shadow-sm hover:bg-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex justify-end w-full max-w-[600px]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-stone-800 text-white font-medium hover:bg-stone-900 transition-colors disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {isSaving ? 'Saving...' : 'Done Editing'}
        </button>
      </div>
    </div>
  );
});

export default EditorCanvas;
