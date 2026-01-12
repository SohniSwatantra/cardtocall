import { useState, useRef, useCallback } from 'react';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onRetake: () => void;
  capturedImage: string | null;
}

export default function CameraCapture({ onCapture, onRetake, capturedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        onCapture(imageData);
      }
    }
  }, [stopCamera, onCapture]);

  const handleRetake = useCallback(() => {
    onRetake();
    startCamera();
  }, [onRetake, startCamera]);

  if (capturedImage) {
    return (
      <div className="camera-capture">
        <div className="captured-preview">
          <img src={capturedImage} alt="Captured card" />
        </div>
        <button onClick={handleRetake} className="btn btn-secondary">
          Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      {error && (
        <div className="camera-error">
          <p>{error}</p>
          <button onClick={startCamera} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}

      {!isCameraActive && !error && (
        <div className="camera-start">
          <div className="camera-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p>Position the business card in frame</p>
          <button onClick={startCamera} className="btn btn-primary">
            Start Camera
          </button>
        </div>
      )}

      {isCameraActive && (
        <div className="camera-active">
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="capture-guide">
              <div className="guide-corners">
                <span className="corner top-left"></span>
                <span className="corner top-right"></span>
                <span className="corner bottom-left"></span>
                <span className="corner bottom-right"></span>
              </div>
            </div>
          </div>
          <div className="camera-controls">
            <button onClick={stopCamera} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={captureImage} className="btn btn-primary btn-capture">
              Capture
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
