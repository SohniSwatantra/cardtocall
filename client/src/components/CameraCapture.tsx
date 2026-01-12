import { useRef } from 'react';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

// Compress and resize image to reduce payload size
function compressImage(file: File, maxWidth: number = 1600, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG for better compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Read file as data URL to load into image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function CameraCapture({ onCapture, onRetake, capturedImage }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image before processing
        const compressedImage = await compressImage(file);
        onCapture(compressedImage);
      } catch (err) {
        console.error('Image compression error:', err);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          onCapture(imageData);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  if (capturedImage) {
    return (
      <div className="camera-capture">
        <div className="captured-preview">
          <img src={capturedImage} alt="Captured card" />
        </div>
        <button onClick={onRetake} className="btn btn-secondary">
          Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="camera-start">
        <div className="camera-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <p>Take a photo of the business card</p>
        <button onClick={handleCaptureClick} className="btn btn-primary">
          Open Camera
        </button>
      </div>
    </div>
  );
}
