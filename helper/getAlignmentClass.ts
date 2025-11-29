import { ColumnAlignment } from "@/types/column-alignment";

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
