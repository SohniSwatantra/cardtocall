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
              <Link to="/app" className="scan-link">
                Scan a business card to add your first contact
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="contacts-list">
          {contacts.map(contact => (
            <Link to={`/app/contacts/${contact.id}`} key={contact.id} className="contact-row">
              <div className="contact-avatar">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="contact-info">
                <div className="contact-main">
                  <h3 className="contact-name">{contact.name}</h3>
                  {contact.company && (
                    <span className="contact-company">{contact.company}</span>
                  )}
                </div>
                <div className="contact-secondary">
                  {(contact.mobile || contact.phone) && (
                    <span className="contact-phone">{contact.mobile || contact.phone}</span>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <span className="contact-tag-count">{contact.tags.length} tag{contact.tags.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <div className="contact-chevron">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
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
