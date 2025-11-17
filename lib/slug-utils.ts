export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Nur Buchstaben, Zahlen, Spaces, Hyphens
    .replace(/[\s_-]+/g, "-") // Spaces/Underscores → Hyphens
    .replace(/^-+|-+$/g, ""); // Leading/Trailing Hyphens entfernen
}
