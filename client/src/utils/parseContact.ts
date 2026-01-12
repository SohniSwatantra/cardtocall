export interface ParsedContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  address: string;
  website: string;
}

export function parseContactFromText(text: string): ParsedContact {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const contact: ParsedContact = {
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    website: ''
  };

  // Email pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Phone pattern (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|(?:\+?[0-9]{1,3}[-.\s]?)?[0-9]{10,}/g;

  // Website pattern
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;

  // Common job titles
  const jobTitleKeywords = [
    'ceo', 'cto', 'cfo', 'coo', 'director', 'manager', 'engineer', 'developer',
    'designer', 'analyst', 'consultant', 'president', 'vice president', 'vp',
    'founder', 'co-founder', 'partner', 'associate', 'executive', 'officer',
    'head of', 'lead', 'senior', 'junior', 'chief', 'specialist', 'coordinator'
  ];

  const usedLines = new Set<number>();

  // Extract email
  for (let i = 0; i < lines.length; i++) {
    const emailMatch = lines[i].match(emailRegex);
    if (emailMatch) {
      contact.email = emailMatch[0];
      usedLines.add(i);
      break;
    }
  }

  // Extract phone
  for (let i = 0; i < lines.length; i++) {
    const phoneMatch = lines[i].match(phoneRegex);
    if (phoneMatch) {
      contact.phone = phoneMatch[0].replace(/[^\d+]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
      usedLines.add(i);
      break;
    }
  }

  // Extract website (that's not part of email)
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i)) continue;
    const websiteMatch = lines[i].match(websiteRegex);
    if (websiteMatch) {
      const url = websiteMatch[0];
      // Skip if it looks like an email domain
      if (!url.includes('@') && !contact.email.includes(url)) {
        contact.website = url.startsWith('http') ? url : `https://${url}`;
        usedLines.add(i);
        break;
      }
    }
  }

  // Extract job title
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i)) continue;
    const lineLower = lines[i].toLowerCase();
    if (jobTitleKeywords.some(keyword => lineLower.includes(keyword))) {
      contact.jobTitle = lines[i];
      usedLines.add(i);
      break;
    }
  }

  // The first non-used line that looks like a name (contains letters, no numbers, not too long)
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i)) continue;
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 50 &&
      /^[a-zA-Z\s.'-]+$/.test(line) &&
      !jobTitleKeywords.some(kw => line.toLowerCase().includes(kw))
    ) {
      contact.name = line;
      usedLines.add(i);
      break;
    }
  }

  // Look for company name (often comes after name, before contact details)
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i)) continue;
    const line = lines[i];
    // Company names often have Inc, LLC, Corp, Ltd, or are capitalized
    if (
      /\b(inc|llc|corp|ltd|limited|company|co|group|solutions|technologies|services)\b/i.test(line) ||
      (line.length > 2 && line.length < 60 && /^[A-Z]/.test(line) && !phoneRegex.test(line))
    ) {
      contact.company = line;
      usedLines.add(i);
      break;
    }
  }

  // Address - look for lines with numbers and common address words
  const addressKeywords = ['street', 'st', 'avenue', 'ave', 'road', 'rd', 'drive', 'dr', 'suite', 'floor', 'blvd', 'lane', 'ln'];
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i)) continue;
    const lineLower = lines[i].toLowerCase();
    if (
      /\d+/.test(lines[i]) &&
      (addressKeywords.some(kw => lineLower.includes(kw)) || /\d{5}/.test(lines[i]))
    ) {
      contact.address = lines[i];
      usedLines.add(i);
      break;
    }
  }

  return contact;
}
