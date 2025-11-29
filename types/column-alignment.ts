import { ReactNode } from "react";

export type ColumnAlignment = "left" | "center" | "right";

export interface Column<T> {
  key: string;
  label: string;
  align?: ColumnAlignment;
  render: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
}
