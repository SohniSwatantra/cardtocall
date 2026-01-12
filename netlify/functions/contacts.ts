import type { Context } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  company: string | null;
  job_title: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace("/.netlify/functions/contacts", "").split("/").filter(Boolean);
  const id = pathParts[0] && !isNaN(Number(pathParts[0])) ? Number(pathParts[0]) : null;
  const isSearch = pathParts[0] === "search";

  try {
    // GET /contacts/search
    if (req.method === "GET" && isSearch) {
      const query = url.searchParams.get("q") || "";
      const tagsParam = url.searchParams.get("tags");
      const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()) : [];

      let contacts: Contact[];

      if (query && tags.length > 0) {
        const searchPattern = `%${query}%`;
        contacts = await sql`
          SELECT * FROM contacts
          WHERE (
            name ILIKE ${searchPattern}
            OR email ILIKE ${searchPattern}
            OR company ILIKE ${searchPattern}
          )
          AND tags && ${tags}::text[]
          ORDER BY
            CASE WHEN name ILIKE ${searchPattern} THEN 0 ELSE 1 END,
            created_at DESC
        `;
      } else if (query) {
        const searchPattern = `%${query}%`;
        contacts = await sql`
          SELECT * FROM contacts
          WHERE name ILIKE ${searchPattern}
            OR email ILIKE ${searchPattern}
            OR company ILIKE ${searchPattern}
          ORDER BY
            CASE WHEN name ILIKE ${searchPattern} THEN 0 ELSE 1 END,
            created_at DESC
        `;
      } else if (tags.length > 0) {
        contacts = await sql`
          SELECT * FROM contacts
          WHERE tags && ${tags}::text[]
          ORDER BY created_at DESC
        `;
      } else {
        contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
      }

      return new Response(JSON.stringify(contacts), { status: 200, headers });
    }

    // GET /contacts/:id
    if (req.method === "GET" && id) {
      const contacts = await sql`SELECT * FROM contacts WHERE id = ${id}`;
      if (contacts.length === 0) {
        return new Response(JSON.stringify({ error: "Contact not found" }), { status: 404, headers });
      }
      return new Response(JSON.stringify(contacts[0]), { status: 200, headers });
    }

    // GET /contacts
    if (req.method === "GET") {
      const contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
      return new Response(JSON.stringify(contacts), { status: 200, headers });
    }

    // POST /contacts
    if (req.method === "POST") {
      const body = await req.json();
      const { name, email, phone, mobile, company, job_title, address, website, notes, tags } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: "Name is required" }), { status: 400, headers });
      }

      const result = await sql`
        INSERT INTO contacts (name, email, phone, mobile, company, job_title, address, website, notes, tags)
        VALUES (${name}, ${email || null}, ${phone || null}, ${mobile || null}, ${company || null}, ${job_title || null}, ${address || null}, ${website || null}, ${notes || null}, ${tags || []})
        RETURNING *
      `;

      return new Response(JSON.stringify(result[0]), { status: 201, headers });
    }

    // PUT /contacts/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const { name, email, phone, mobile, company, job_title, address, website, notes, tags } = body;

      const result = await sql`
        UPDATE contacts
        SET
          name = COALESCE(${name}, name),
          email = ${email || null},
          phone = ${phone || null},
          mobile = ${mobile || null},
          company = ${company || null},
          job_title = ${job_title || null},
          address = ${address || null},
          website = ${website || null},
          notes = ${notes || null},
          tags = COALESCE(${tags}, tags),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "Contact not found" }), { status: 404, headers });
      }

      return new Response(JSON.stringify(result[0]), { status: 200, headers });
    }

    // DELETE /contacts/:id
    if (req.method === "DELETE" && id) {
      const result = await sql`DELETE FROM contacts WHERE id = ${id} RETURNING id`;

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "Contact not found" }), { status: 404, headers });
      }

      return new Response(JSON.stringify({ message: "Contact deleted" }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers });
  }
};
