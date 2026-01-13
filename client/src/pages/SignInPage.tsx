import { AuthView } from '@neondatabase/auth/react/ui';
import { Link } from 'react-router-dom';
import './AuthPage.css';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>
      <div className="auth-container">
        <h1>Sign In</h1>
        <p className="auth-description">Welcome back to CardToCall</p>
        <AuthView path="sign-in" />
      </div>
    </div>
  );
}
