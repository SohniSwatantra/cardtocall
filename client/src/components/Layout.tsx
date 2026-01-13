import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserButton } from '@neondatabase/auth/react/ui';
import { authClient } from '../auth';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!session.isPending && !session.data?.user) {
      navigate('/sign-in');
    }
  }, [session, navigate]);

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
          <div className="header-user">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
