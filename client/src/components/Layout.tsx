import { useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authClient } from '../auth';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!session.isPending && !session.data?.user) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await authClient.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if sign out fails
      navigate('/');
    }
  }, [navigate]);

  // Show loading while checking auth
  if (session.isPending) {
    return (
      <div className="app-layout">
        <div className="auth-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session.data?.user) {
    return null;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <NavLink to="/app" className="app-logo">
            CardToCall
          </NavLink>
          <nav className="app-nav">
            <NavLink
              to="/app"
              end
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Scan
            </NavLink>
            <NavLink
              to="/app/contacts"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Contacts
            </NavLink>
          </nav>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
