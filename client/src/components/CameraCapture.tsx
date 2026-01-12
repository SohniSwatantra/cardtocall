import { useRef } from 'react';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

export default function CameraCapture({ onCapture, onRetake, capturedImage }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
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
