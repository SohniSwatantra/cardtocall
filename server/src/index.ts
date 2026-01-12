import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CardToCall API is running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ status: 'ok', message: 'Database connection successful' });
    } else {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'error', message: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
