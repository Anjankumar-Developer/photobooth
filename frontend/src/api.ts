import axios from 'axios';

// In a real app, these would point to actual backend endpoints.
// We use axios to attempt the call, and fallback to mock data if the backend isn't available.

const MOCK_DELAY = 800;

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

export const api = {
  uploadPhoto: async (photoDataUrl: string) => {
    try {
      const res = await axios.post('/upload-photo', { photo: photoDataUrl });
      return res.data;
    } catch (e) {
      await simulateDelay();
      return { success: true, url: photoDataUrl };
    }
  },
  applyFilter: async (photoUrl: string, filterType: string) => {
    try {
      const res = await axios.post('/apply-filter', { photoUrl, filterType });
      return res.data;
    } catch (e) {
      await simulateDelay();
      return { success: true, url: photoUrl };
    }
  },
  addFrame: async (photoUrl: string, frameType: string) => {
    try {
      const res = await axios.post('/add-frame', { photoUrl, frameType });
      return res.data;
    } catch (e) {
      await simulateDelay();
      return { success: true, url: photoUrl };
    }
  },
  addSticker: async (photoUrl: string, stickerType: string) => {
    try {
      const res = await axios.post('/add-sticker', { photoUrl, stickerType });
      return res.data;
    } catch (e) {
      await simulateDelay();
      return { success: true, url: photoUrl };
    }
  },
  generatePhotoStrip: async (photos: string[]) => {
    try {
      const res = await axios.post('/generate-photo-strip', { photos });
      return res.data;
    } catch (e) {
      await simulateDelay();
      return { success: true, stripUrl: photos[0] || '' };
    }
  }
};
