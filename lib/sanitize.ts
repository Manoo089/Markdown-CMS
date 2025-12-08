/**
 * HTML Sanitization Utility
 *
 * Sanitizes HTML content before storing in database.
 * This ensures all content served via API is safe.
 */

import sanitizeHtml from "sanitize-html";

/**
 * Default sanitize options for rich text content
 *
 * Allows common formatting tags from Tiptap editor
 * while stripping potentially dangerous elements.
 */
const defaultOptions: sanitizeHtml.IOptions = {
  // Allowed HTML tags
  allowedTags: [
    // Headings
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // Text formatting
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "code",
    "pre",
    // Lists
    "ul",
    "ol",
    "li",
    // Links & Media
    "a",
    "img",
    // Blocks
    "blockquote",
    "div",
    "span",
  ],

  // Allowed attributes per tag
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "title", "class", "width", "height"],
    code: ["class"], // For syntax highlighting classes
    pre: ["class"],
    div: ["class"],
    span: ["class"],
    p: ["class"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
  },

  // Allowed URL schemes
  allowedSchemes: ["http", "https", "mailto"],

  // Force target="_blank" links to have rel="noopener noreferrer"
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
          },
        };
      }
      return { tagName, attribs };
    },
  },

  // Strip empty tags
  exclusiveFilter: (frame) => {
    // Remove empty paragraphs (but keep <br>, <hr>, <img>)
    if (
      frame.tag === "p" &&
      !frame.text.trim() &&
      frame.mediaChildren.length === 0
    ) {
      return true;
    }
    return false;
  },
};

/**
 * Sanitize HTML content
 *
 * @param dirty - Untrusted HTML string
 * @param options - Optional custom sanitize options
 * @returns Sanitized HTML string safe for storage and rendering
 *
 * @example
 * ```typescript
 * const cleanHtml = sanitizeContent('<p>Hello <script>alert("xss")</script></p>');
 * // Returns: '<p>Hello </p>'
 * ```
 */
export function sanitizeContent(
  dirty: string,
  options?: sanitizeHtml.IOptions,
): string {
  return sanitizeHtml(dirty, options ?? defaultOptions);
}

/**
 * Check if content contains potentially dangerous HTML
 *
 * Useful for logging or alerting on suspicious content
 */
export function hasDangerousContent(html: string): boolean {
  const dangerous = /<script|<iframe|javascript:|on\w+=/i;
  return dangerous.test(html);
}
