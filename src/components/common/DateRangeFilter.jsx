export default function DateRangeFilter({ startDate, endDate, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onChange({ startDate: e.target.value, endDate })}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
      />
      <span className="text-gray-400 text-sm">إلى</span>
      <input
        type="date"
        value={endDate || ''}
        onChange={(e) => onChange({ startDate, endDate: e.target.value })}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
