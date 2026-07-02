export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-gradient-to-l from-[#2563EB] to-[#7C3AED] h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
