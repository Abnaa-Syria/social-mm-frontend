import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function Table({ columns, data, loading, emptyMessage = 'لا توجد بيانات' }) {
  if (loading) return <LoadingState />;
  if (!data?.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-right font-extrabold text-gray-600 whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-blue-50/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
