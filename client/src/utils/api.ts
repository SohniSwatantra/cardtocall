const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  address?: string;
  website?: string;
  notes?: string;
  tags?: string[];
}

export async function fetchContacts(): Promise<Contact[]> {
  const response = await fetch(`${API_BASE}/api/contacts`);
  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return response.json();
}

export async function fetchContact(id: number): Promise<Contact> {
  const response = await fetch(`${API_BASE}/api/contacts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contact');
  }
  return response.json();
}

export async function createContact(data: CreateContactData): Promise<Contact> {
  const response = await fetch(`${API_BASE}/api/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create contact');
  }
  return response.json();
}

export async function updateContact(id: number, data: Partial<CreateContactData>): Promise<Contact> {
  const response = await fetch(`${API_BASE}/api/contacts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update contact');
  }
  return response.json();
}

export async function deleteContact(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete contact');
  }
}

export async function searchContacts(query: string, tags?: string[]): Promise<Contact[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (tags && tags.length > 0) params.set('tags', tags.join(','));

  const response = await fetch(`${API_BASE}/api/contacts/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search contacts');
  }
  return response.json();
}

export function exportToCSV(contacts: Contact[]): string {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Address', 'Website', 'Notes', 'Tags'];
  const rows = contacts.map(c => [
    c.name,
    c.email || '',
    c.phone || '',
    c.company || '',
    c.job_title || '',
    c.address || '',
    c.website || '',
    c.notes || '',
    (c.tags || []).join('; ')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function exportToVCard(contact: Contact): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
  ];

  if (contact.email) {
    lines.push(`EMAIL:${contact.email}`);
  }
  if (contact.phone) {
    lines.push(`TEL:${contact.phone}`);
  }
  if (contact.company) {
    lines.push(`ORG:${contact.company}`);
  }
  if (contact.job_title) {
    lines.push(`TITLE:${contact.job_title}`);
  }
  if (contact.address) {
    lines.push(`ADR:;;${contact.address};;;;`);
  }
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }
  if (contact.notes) {
    lines.push(`NOTE:${contact.notes.replace(/\n/g, '\\n')}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
