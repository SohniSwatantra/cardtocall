import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchContact, updateContact, deleteContact, exportToVCard, downloadFile, type Contact } from '../utils/api';
import './ContactDetailPage.css';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [tagInput, setTagInput] = useState('');

  const loadContact = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchContact(parseInt(id, 10));
      setContact(data);
      setEditData(data);
    } catch (err) {
      console.error('Failed to load contact:', err);
      setError('Failed to load contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(contact || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(contact || {});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !editData.tags?.includes(tag)) {
      setEditData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      const updated = await updateContact(parseInt(id, 10), {
        name: editData.name || '',
        email: editData.email || undefined,
        phone: editData.phone || undefined,
        company: editData.company || undefined,
        job_title: editData.job_title || undefined,
        address: editData.address || undefined,
        website: editData.website || undefined,
        notes: editData.notes || undefined,
        tags: editData.tags || [],
      });
      setContact(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContact(parseInt(id, 10));
      navigate('/contacts');
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete contact. Please try again.');
    }
  };

  const handleExportVCard = () => {
    if (!contact) return;
    const vcard = exportToVCard(contact);
    const filename = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    downloadFile(vcard, filename, 'text/vcard');
  };

  if (isLoading) {
    return (
      <div className="contact-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error && !contact) {
    return (
      <div className="contact-detail-page">
        <div className="error-state">
          <p>{error}</p>
          <Link to="/contacts" className="btn btn-primary">Back to Contacts</Link>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="contact-detail-page">
        <div className="error-state">
          <p>Contact not found</p>
          <Link to="/contacts" className="btn btn-primary">Back to Contacts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-detail-page">
      <Link to="/contacts" className="back-link">
        ← Back to Contacts
      </Link>

      <div className="contact-detail-card">
        <div className="contact-header">
          <div className="contact-avatar">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="contact-header-info">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name || ''}
                onChange={handleChange}
                className="edit-name"
                placeholder="Name"
              />
            ) : (
              <h1>{contact.name}</h1>
            )}
            {isEditing ? (
              <input
                type="text"
                name="job_title"
                value={editData.job_title || ''}
                onChange={handleChange}
                placeholder="Job Title"
              />
            ) : (
              contact.job_title && <p className="job-title">{contact.job_title}</p>
            )}
            {isEditing ? (
              <input
                type="text"
                name="company"
                value={editData.company || ''}
                onChange={handleChange}
                placeholder="Company"
              />
            ) : (
              contact.company && <p className="company">{contact.company}</p>
            )}
          </div>
          <div className="contact-actions">
            {!isEditing && (
              <>
                <button onClick={handleExportVCard} className="btn btn-secondary">
                  Export vCard
                </button>
                <button onClick={handleEdit} className="btn btn-primary">
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="contact-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email || ''}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                ) : (
                  <p>{contact.email || '—'}</p>
                )}
              </div>
              <div className="detail-item">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleChange}
                    placeholder="Phone"
                  />
                ) : (
                  <p>{contact.phone || '—'}</p>
                )}
              </div>
              <div className="detail-item">
                <label>Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={editData.website || ''}
                    onChange={handleChange}
                    placeholder="Website"
                  />
                ) : (
                  <p>
                    {contact.website ? (
                      <a href={contact.website} target="_blank" rel="noopener noreferrer">
                        {contact.website}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>
              <div className="detail-item full-width">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editData.address || ''}
                    onChange={handleChange}
                    placeholder="Address"
                  />
                ) : (
                  <p>{contact.address || '—'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Notes</h3>
            {isEditing ? (
              <textarea
                name="notes"
                value={editData.notes || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Add notes about this contact..."
              />
            ) : (
              <p className="notes-content">{contact.notes || 'No notes added'}</p>
            )}
          </div>

          <div className="detail-section">
            <h3>Tags</h3>
            {isEditing ? (
              <div className="tags-edit">
                <div className="tags-list">
                  {(editData.tags || []).map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-wrapper">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag"
                  />
                  <button type="button" onClick={handleAddTag} className="btn-add-tag">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="tags-display">
                {contact.tags && contact.tags.length > 0 ? (
                  contact.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))
                ) : (
                  <p className="no-tags">No tags added</p>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger">
              Delete Contact
            </button>
            <div className="edit-actions-right">
              <button onClick={handleCancel} className="btn btn-secondary" disabled={isSaving}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        <div className="contact-meta">
          <p>Added on {new Date(contact.created_at).toLocaleDateString()}</p>
          {contact.updated_at !== contact.created_at && (
            <p>Last updated {new Date(contact.updated_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete Contact?</h2>
            <p>Are you sure you want to delete {contact.name}? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}
