export default function FilterBar({ children }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-2xl border border-gray-100">
      {children}
    </div>
  );
}
