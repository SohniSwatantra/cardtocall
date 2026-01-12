import { useParams, Link } from 'react-router-dom';
import './ContactDetailPage.css';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="contact-detail-page">
      <Link to="/contacts" className="back-link">
        &larr; Back to Contacts
      </Link>
      <div className="contact-detail-card">
        <h1>Contact Details</h1>
        <p className="contact-id">Contact ID: {id}</p>
        <p className="coming-soon">Full contact details will be displayed here.</p>
      </div>
    </div>
  );
}
