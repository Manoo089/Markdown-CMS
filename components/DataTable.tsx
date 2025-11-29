import Link from "next/link";
import { DataTableProps } from "@/types/column-alignment";
import { getAlignmentClass } from "@/lib/utils/alignment";

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found.",
  emptyAction,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg shadow border border-border">
        <p className="text-text-muted mb-4">{emptyMessage}</p>
        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  // Table
  return (
    <div className="bg-surface rounded-lg shadow border border-border overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-hover">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider ${getAlignmentClass(column.align)}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-surface-hover transition"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap ${getAlignmentClass(column.align)}`}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
