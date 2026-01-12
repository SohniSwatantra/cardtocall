# CardToCall

A conference networking app that lets you scan business cards with your phone camera and automatically extract contact information using OCR.

## Features

- **Camera Scanning** - Use your device camera to capture business cards
- **OCR Text Extraction** - Automatically extracts text using Tesseract.js
- **Smart Parsing** - Intelligently identifies name, email, phone, company, job title, address, and website
- **Notes & Tags** - Add context notes and tags to organize contacts (e.g., "TechConf 2024", "Follow up")
- **Search & Filter** - Find contacts by name, email, company, or filter by tags
- **Export Options** - Download all contacts as CSV or individual contacts as vCard (.vcf)

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Netlify Functions (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **OCR**: Tesseract.js (client-side)

## Deploy to Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SohniSwatantra/cardtocall)

### Manual Deployment

1. Fork or clone this repository to your GitHub account

2. Go to [Netlify](https://app.netlify.com) and click "Add new site" → "Import an existing project"

3. Connect your GitHub repository

4. Configure build settings (should auto-detect from `netlify.toml`):
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

5. Add environment variable in **Site Settings → Environment Variables**:
   ```
   DATABASE_URL = postgresql://user:password@host/database?sslmode=require
   ```

6. Deploy!

### Database Setup

1. Create a free database at [Neon](https://neon.tech)

2. Copy your connection string from the Neon dashboard

3. Run the migration to create the contacts table:
   ```sql
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
   );
   ```
   You can run this in the Neon SQL Editor.

## Local Development

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SohniSwatantra/cardtocall.git
   cd cardtocall
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` and add your Neon database connection string:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

4. Run database migrations:
   ```bash
   cd server && npm run migrate
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Project Structure

```
cardtocall/
├── client/                   # React frontend
│   └── src/
│       ├── components/       # CameraCapture, ContactForm, Layout
│       ├── pages/            # HomePage, ContactsPage, ContactDetailPage
│       └── utils/            # API client, contact parser
├── netlify/
│   └── functions/            # Netlify serverless functions
│       └── contacts.ts       # Contacts API (CRUD + search)
├── server/                   # Express backend (for local dev)
│   └── src/
│       ├── routes/           # API routes
│       ├── migrations/       # Database schema
│       └── db.ts             # Database connection
├── netlify.toml              # Netlify configuration
└── package.json              # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List all contacts |
| GET | `/api/contacts/:id` | Get single contact |
| POST | `/api/contacts` | Create new contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| GET | `/api/contacts/search` | Search contacts (query: `q`, `tags`) |

## Usage

1. **Scan a Card**: Click "Scan" and allow camera access. Position the business card in frame and capture.

2. **Review & Edit**: The OCR will extract text and parse it into fields. Review and correct any errors.

3. **Add Context**: Add notes about where you met and tags for organization.

4. **Save**: The contact is stored in your database.

5. **Manage Contacts**: Browse, search, edit, or delete contacts from the Contacts page.

6. **Export**: Download all contacts as CSV or export individual contacts as vCard files.

## License

MIT
