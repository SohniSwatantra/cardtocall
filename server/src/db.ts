import { neon, neonConfig } from '@neondatabase/serverless';

// Configure for HTTP mode (serverless-friendly)
neonConfig.fetchConnectionCache = true;

// Get the database URL from environment variables
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
};

// Create a SQL query function for the database
export const sql = neon(getDatabaseUrl());

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await sql`SELECT 1 as test`;
    return result.length > 0 && result[0].test === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export default sql;
