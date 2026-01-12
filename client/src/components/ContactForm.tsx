import { useState } from 'react';
import type { ParsedContact } from '../utils/parseContact';
import './ContactForm.css';

interface ContactFormProps {
  initialData: ParsedContact;
  onSave: (contact: ParsedContact & { notes: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ContactForm({ initialData, onSave, onCancel, isLoading }: ContactFormProps) {
  const [formData, setFormData] = useState<ParsedContact & { notes: string; tags: string[] }>({
    ...initialData,
    notes: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>Review Contact Details</h2>
      <p className="form-description">Edit any fields that weren't correctly extracted</p>

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Full name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Job title"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street address, city, state"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Where did you meet? Topics discussed?"
        />
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="tags-input">
          <div className="tags-list">
            {formData.tags.map(tag => (
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
              onKeyDown={handleKeyDown}
              placeholder="Add tag (e.g., conference name)"
            />
            <button type="button" onClick={handleAddTag} className="btn-add-tag">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}
