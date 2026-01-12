import type { Context } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactData {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  address: string;
  website: string;
}

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers,
      });
    }

    // Extract base64 data and media type from data URL
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return new Response(JSON.stringify({ error: "Invalid image format" }), {
        status: 400,
        headers,
      });
    }

    const mediaType = matches[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const base64Data = matches[2];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: `Analyze this business card image and extract the contact information.

Return ONLY a valid JSON object with these exact fields (use empty string "" if a field is not found):
{
  "name": "Full name of the person",
  "email": "Email address",
  "phone": "Phone number",
  "company": "Company or organization name",
  "job_title": "Job title or position",
  "address": "Full address",
  "website": "Website URL"
}

Important:
- Extract exactly what you see on the card
- For phone numbers, include the full number with any country codes
- For addresses, combine all address parts into one string
- Return ONLY the JSON object, no additional text or markdown`,
            },
          ],
        },
      ],
    });

    // Extract the text content from Claude's response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON from Claude's response
    let contactData: ContactData;
    try {
      // Remove any markdown code blocks if present
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      }
      contactData = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Failed to parse contact data from image");
    }

    return new Response(JSON.stringify(contactData), { status: 200, headers });
  } catch (error) {
    console.error("Analyze card error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze card";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers,
    });
  }
};
