import { Link } from 'react-router-dom';
import './ContactsPage.css';

export default function ContactsPage() {
  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1>Contacts</h1>
      </div>
      <div className="contacts-empty">
        <div className="empty-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p>No contacts yet</p>
        <Link to="/" className="scan-link">
          Scan a business card to add your first contact
        </Link>
      </div>
    </div>
  );
}
