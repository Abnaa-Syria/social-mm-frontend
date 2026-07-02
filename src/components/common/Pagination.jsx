import { ChevronRight, ChevronLeft } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500">إجمالي {total} عنصر</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronRight size={16} /> السابق
        </Button>
        <span className="text-sm font-bold text-gray-700 px-3">{page} / {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          التالي <ChevronLeft size={16} />
        </Button>
      </div>
    </div>
  );
}
