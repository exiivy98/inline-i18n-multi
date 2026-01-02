/**
 * Generate a short hash from translation content.
 * Uses a simple djb2 algorithm for fast, deterministic hashing.
 */
export function generateHash(content: string, length: number = 8): string {
  let hash = 5381

  for (let i = 0; i < content.length; i++) {
    hash = (hash * 33) ^ content.charCodeAt(i)
  }

  // Convert to base36 for shorter output (0-9, a-z)
  const hashStr = Math.abs(hash).toString(36)

  return hashStr.slice(0, length)
}

/**
 * Generate hash from translations object.
 * Uses the first translation value for consistency.
 */
export function hashFromTranslations(
  translations: Record<string, string>
): string {
  const values = Object.values(translations)
  if (values.length === 0) return generateHash('')

  // Use first value as the primary key
  return generateHash(values[0])
}
