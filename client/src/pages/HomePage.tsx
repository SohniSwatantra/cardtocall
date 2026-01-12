import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import ContactForm, { type ParsedContact } from '../components/ContactForm';
import { createContact, analyzeCard } from '../utils/api';
import './HomePage.css';

type ScanState = 'camera' | 'processing' | 'review' | 'saving' | 'success' | 'error';

export default function HomePage() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [parsedContact, setParsedContact] = useState<ParsedContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageData: string) => {
    setScanState('processing');

    try {
      const result = await analyzeCard(imageData);

      // Map snake_case API response to camelCase for the form
      const contact: ParsedContact = {
        name: result.name || '',
        email: result.email || '',
        phone: result.phone || '',
        company: result.company || '',
        jobTitle: result.job_title || '',
        address: result.address || '',
        website: result.website || '',
      };

      setParsedContact(contact);
      setScanState('review');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
      setScanState('error');
    }
  }, []);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    processImage(imageData);
  }, [processImage]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setParsedContact(null);
    setError(null);
    setScanState('camera');
  }, []);

  const handleSave = useCallback(async (contactData: ParsedContact & { notes: string; tags: string[] }) => {
    setScanState('saving');
    try {
      await createContact({
        name: contactData.name,
        email: contactData.email || undefined,
        phone: contactData.phone || undefined,
        company: contactData.company || undefined,
        job_title: contactData.jobTitle || undefined,
        address: contactData.address || undefined,
        website: contactData.website || undefined,
        notes: contactData.notes || undefined,
        tags: contactData.tags,
      });
      setScanState('success');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save contact. Please try again.');
      setScanState('error');
    }
  }, []);

  const handleScanAnother = useCallback(() => {
    setCapturedImage(null);
    setParsedContact(null);
    setError(null);
    setScanState('camera');
  }, []);

  return (
    <div className="home-page">
      {scanState === 'camera' && (
        <>
          <h1>Scan Business Card</h1>
          <p className="home-description">
            Use your camera to scan a business card and automatically extract contact information.
          </p>
          <CameraCapture
            onCapture={handleCapture}
            onRetake={handleRetake}
            capturedImage={capturedImage}
          />
        </>
      )}

      {scanState === 'processing' && (
        <div className="processing-state">
          <div className="captured-image">
            {capturedImage && <img src={capturedImage} alt="Captured card" />}
          </div>
          <div className="processing-info">
            <div className="spinner"></div>
            <h2>Analyzing card...</h2>
            <p>Using AI to extract contact information</p>
          </div>
        </div>
      )}

      {scanState === 'review' && parsedContact && (
        <div className="review-state">
          <div className="review-layout">
            <div className="image-preview">
              {capturedImage && <img src={capturedImage} alt="Captured card" />}
            </div>
            <ContactForm
              initialData={parsedContact}
              onSave={handleSave}
              onCancel={handleRetake}
              isLoading={false}
            />
          </div>
        </div>
      )}

      {scanState === 'saving' && (
        <div className="saving-state">
          <div className="spinner"></div>
          <h2>Saving contact...</h2>
        </div>
      )}

      {scanState === 'success' && (
        <div className="success-state">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Contact Saved!</h2>
          <p>The contact has been added to your list.</p>
          <div className="success-actions">
            <button onClick={handleScanAnother} className="btn btn-secondary">
              Scan Another
            </button>
            <button onClick={() => navigate('/contacts')} className="btn btn-primary">
              View Contacts
            </button>
          </div>
        </div>
      )}

      {scanState === 'error' && (
        <div className="error-state">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRetake} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
