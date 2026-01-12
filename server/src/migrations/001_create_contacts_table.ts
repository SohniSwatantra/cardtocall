import 'dotenv/config';
import { sql } from '../db';

/**
 * Migration: Create contacts table
 *
 * Creates the contacts table with all fields needed for storing scanned business card data.
 */
async function migrate() {
  console.log('Running migration: Create contacts table...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        job_title VARCHAR(255),
        address TEXT,
        website VARCHAR(255),
        notes TEXT,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Migration completed: contacts table created successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrate();
