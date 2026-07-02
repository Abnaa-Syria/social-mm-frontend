import { Globe } from 'lucide-react';

export default function PlatformBadge({ platform, className = '' }) {
  if (!platform) return null;
  const color = platform.color || '#2563EB';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {platform.icon ? (
        <img src={platform.icon} alt="" className="w-3.5 h-3.5 rounded" />
      ) : (
        <Globe size={12} />
      )}
      {platform.name}
    </span>
  );
}
