import { Router, Request, Response } from 'express';
import { sql } from '../db';

const router = Router();

// Contact type definition
interface Contact {
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
  created_at: Date;
  updated_at: Date;
}

// Create a new contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      job_title,
      address,
      website,
      notes,
      tags = []
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await sql`
      INSERT INTO contacts (name, email, phone, company, job_title, address, website, notes, tags)
      VALUES (${name}, ${email || null}, ${phone || null}, ${company || null}, ${job_title || null}, ${address || null}, ${website || null}, ${notes || null}, ${tags})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to create contact', details: message });
  }
});

// Get all contacts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await sql`
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `;

    res.json(result);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch contacts', details: message });
  }
});

// Get a single contact by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      res.status(400).json({ error: 'Invalid contact ID' });
      return;
    }

    const result = await sql`
      SELECT * FROM contacts
      WHERE id = ${contactId}
    `;

    if (result.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch contact', details: message });
  }
});

// Update a contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      res.status(400).json({ error: 'Invalid contact ID' });
      return;
    }

    const {
      name,
      email,
      phone,
      company,
      job_title,
      address,
      website,
      notes,
      tags
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await sql`
      UPDATE contacts
      SET name = ${name},
          email = ${email || null},
          phone = ${phone || null},
          company = ${company || null},
          job_title = ${job_title || null},
          address = ${address || null},
          website = ${website || null},
          notes = ${notes || null},
          tags = ${tags || []},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${contactId}
      RETURNING *
    `;

    if (result.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to update contact', details: message });
  }
});

// Delete a contact
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      res.status(400).json({ error: 'Invalid contact ID' });
      return;
    }

    const result = await sql`
      DELETE FROM contacts
      WHERE id = ${contactId}
      RETURNING *
    `;

    if (result.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact deleted successfully', contact: result[0] });
  } catch (error) {
    console.error('Error deleting contact:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to delete contact', details: message });
  }
});

export default router;
