import Button from "@/ui/Button";

interface Props {
  page: number;
  filterSuffix: string;
  totalPages: number;
}

export default function TotalPages({ page, filterSuffix, totalPages }: Props) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        href={`/?page=${page - 1}${filterSuffix}`}
        label="Previous"
        variant="outline"
        color="secondary"
        disabled={page <= 1}
      />

      <span className="px-4 py-2 text-sm text-text-muted">
        Page {page} of {totalPages}
      </span>

      <Button
        href={`/?page=${page + 1}${filterSuffix}`}
        label="Next"
        variant="outline"
        color="secondary"
        disabled={page >= totalPages}
      />
    </div>
  );
}
