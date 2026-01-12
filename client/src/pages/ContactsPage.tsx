import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchContacts, searchContacts, exportToCSV, downloadFile, type Contact } from '../utils/api';
import './ContactsPage.css';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Get all unique tags from contacts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(contact => {
      (contact.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  // Load contacts
  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search and filter
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery && selectedTags.length === 0) {
        loadContacts();
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchContacts(debouncedQuery, selectedTags);
        setContacts(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, selectedTags, loadContacts]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(contacts);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `contacts-${date}.csv`, 'text/csv');
  };

  if (isLoading && contacts.length === 0) {
    return (
      <div className="contacts-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contacts-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadContacts} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1>Contacts</h1>
        {contacts.length > 0 && (
          <button onClick={handleExportCSV} className="btn btn-secondary">
            Export CSV
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="contacts-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchQuery || selectedTags.length > 0) && (
            <button onClick={handleClearFilters} className="clear-btn">
              Clear
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="tag-filters">
            <span className="filter-label">Filter by tag:</span>
            <div className="tag-chips">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="contacts-empty">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          {searchQuery || selectedTags.length > 0 ? (
            <>
              <p>No contacts match your search</p>
              <button onClick={handleClearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p>No contacts yet</p>
              <Link to="/" className="scan-link">
                Scan a business card to add your first contact
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="contacts-grid">
          {contacts.map(contact => (
            <Link to={`/contacts/${contact.id}`} key={contact.id} className="contact-card">
              <div className="contact-avatar">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="contact-info">
                <h3 className="contact-name">{contact.name}</h3>
                {contact.company && (
                  <p className="contact-company">{contact.company}</p>
                )}
                {contact.email && (
                  <p className="contact-email">{contact.email}</p>
                )}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="contact-tags">
                    {contact.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="tag-more">+{contact.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              {contact.notes && (
                <div className="contact-notes-indicator" title="Has notes">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {isLoading && contacts.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}
