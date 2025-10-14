// Input sanitization utilities

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 255)
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-]/g, "") // Only allow alphanumeric, spaces, and hyphens
    .slice(0, 100)
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
