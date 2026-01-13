import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import { analyzeCard } from '../utils/api';
import { authClient } from '../auth';
import './LandingPage.css';

type TrialState = 'hero' | 'camera' | 'processing' | 'result' | 'error';

interface ParsedContact {
  name: string;
  email: string;
  phone: string;
  mobile: string;
  company: string;
  jobTitle: string;
  address: string;
  website: string;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [trialState, setTrialState] = useState<TrialState>('hero');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [parsedContact, setParsedContact] = useState<ParsedContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);

  // Check if trial already used
  useEffect(() => {
    const used = localStorage.getItem('cardtocall_trial_used') === 'true';
    setTrialUsed(used);
  }, []);

  // Redirect authenticated users to app
  useEffect(() => {
    if (session.data?.user) {
      navigate('/app');
    }
  }, [session, navigate]);

  const handleStartTrial = useCallback(() => {
    setTrialState('camera');
  }, []);

  const processImage = useCallback(async (imageData: string) => {
    setTrialState('processing');

    try {
      const result = await analyzeCard(imageData);

      const contact: ParsedContact = {
        name: result.name || '',
        email: result.email || '',
        phone: result.phone || '',
        mobile: result.mobile || '',
        company: result.company || '',
        jobTitle: result.job_title || '',
        address: result.address || '',
        website: result.website || '',
      };

      setParsedContact(contact);
      setTrialState('result');

      // Mark trial as used
      localStorage.setItem('cardtocall_trial_used', 'true');
      setTrialUsed(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
      setTrialState('error');
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
    setTrialState('camera');
  }, []);

  const handleBackToHero = useCallback(() => {
    setCapturedImage(null);
    setParsedContact(null);
    setError(null);
    setTrialState('hero');
  }, []);

  return (
    <div className="landing-page">
      {trialState === 'hero' && (
        <div className="landing-hero">
          <div className="hero-content">
            <h1>CardToCall</h1>
            <p className="hero-tagline">
              Scan business cards instantly with AI. Save contacts in seconds.
            </p>

            <div className="hero-actions">
              {!trialUsed ? (
                <button onClick={handleStartTrial} className="btn btn-primary btn-large">
                  Try Free Scan
                </button>
              ) : (
                <Link to="/sign-up" className="btn btn-primary btn-large">
                  Sign Up to Continue
                </Link>
              )}
              <Link to="/sign-in" className="btn btn-secondary">
                Sign In
              </Link>
            </div>

            {trialUsed && (
              <p className="trial-used-notice">
                You've used your free trial. Sign up to scan more cards.
              </p>
            )}
          </div>

          <div className="hero-features">
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3>AI-Powered OCR</h3>
              <p>Extract contact info automatically</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Organized Contacts</h3>
              <p>Search, tag, and manage easily</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3>Mobile First</h3>
              <p>Designed for on-the-go scanning</p>
            </div>
          </div>
        </div>
      )}

      {trialState === 'camera' && (
        <div className="trial-scan">
          <button onClick={handleBackToHero} className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <h2>Try It Out</h2>
          <p className="trial-description">Scan a business card to see how it works</p>
          <CameraCapture
            onCapture={handleCapture}
            onRetake={handleRetake}
            capturedImage={capturedImage}
          />
        </div>
      )}

      {trialState === 'processing' && (
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

      {trialState === 'result' && parsedContact && (
        <div className="trial-result">
          <div className="result-header">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Contact Extracted!</h2>
            <p>Here's what we found on the card</p>
          </div>

          <div className="result-preview">
            <div className="result-card">
              <div className="result-image">
                {capturedImage && <img src={capturedImage} alt="Scanned card" />}
              </div>
              <div className="result-data">
                {parsedContact.name && (
                  <div className="result-field">
                    <label>Name</label>
                    <p>{parsedContact.name}</p>
                  </div>
                )}
                {parsedContact.email && (
                  <div className="result-field">
                    <label>Email</label>
                    <p>{parsedContact.email}</p>
                  </div>
                )}
                {(parsedContact.phone || parsedContact.mobile) && (
                  <div className="result-field">
                    <label>Phone</label>
                    <p>{parsedContact.phone || parsedContact.mobile}</p>
                  </div>
                )}
                {parsedContact.company && (
                  <div className="result-field">
                    <label>Company</label>
                    <p>{parsedContact.company}</p>
                  </div>
                )}
                {parsedContact.jobTitle && (
                  <div className="result-field">
                    <label>Title</label>
                    <p>{parsedContact.jobTitle}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="result-cta">
            <p className="cta-text">Sign up to save this contact and scan unlimited cards</p>
            <div className="cta-actions">
              <Link to="/sign-up" className="btn btn-primary btn-large">
                Sign Up to Save
              </Link>
              <Link to="/sign-in" className="btn btn-secondary">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      )}

      {trialState === 'error' && (
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
