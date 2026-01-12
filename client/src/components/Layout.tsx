import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <NavLink to="/" className="app-logo">
            CardToCall
          </NavLink>
          <nav className="app-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Scan
            </NavLink>
            <NavLink
              to="/contacts"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Contacts
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
