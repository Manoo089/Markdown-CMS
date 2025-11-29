/**
 * Table Column Alignment Utilities
 *
 * Helper functions for converting column alignment types to CSS classes
 */

import { ColumnAlignment } from "@/types/column-alignment";

/**
 * Get Tailwind CSS class for column alignment
 *
 * @param align - Column alignment type (left, center, right)
 * @returns Tailwind CSS class for text alignment
 *
 * @example
 * ```typescript
 * getAlignmentClass("center") // Returns "text-center"
 * getAlignmentClass("right")  // Returns "text-right"
 * getAlignmentClass()         // Returns "text-left" (default)
 * ```
 */
export function getAlignmentClass(align: ColumnAlignment = "left"): string {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}
