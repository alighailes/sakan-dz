/**
 * Input sanitization utilities for XSS prevention.
 * React's JSX rendering already escapes content, but these utilities
 * provide defense-in-depth for edge cases (e.g., URL construction,
 * dynamic attribute values, or future dangerouslySetInnerHTML usage).
 */

/**
 * Sanitize user-submitted text to prevent XSS.
 * Strips HTML tags and encodes special characters.
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks.
 * Only allows http:, https:, mailto:, and tel: protocols.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed
  }
  // If no protocol, assume https://
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return `https://${trimmed}`
  }
  // Block javascript: and data: protocols
  return '#'
}

/**
 * Sanitize an email address.
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  return email.trim().toLowerCase().replace(/[^a-z0-9.@+_-]/g, '')
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Validate and sanitize a phone number (Algerian format).
 * Returns empty string if invalid.
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[\s.-]/g, '')
  if (/^0(5|6|7)\d{8}$/.test(cleaned)) {
    return cleaned
  }
  return ''
}
