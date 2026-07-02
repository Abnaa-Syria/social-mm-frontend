export default function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-9 h-9 text-sm' : size === 'md' ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-[10px]';
  const shown = users.slice(0, max);
  const extra = users.length - max;

  if (!users.length) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex -space-x-2 space-x-reverse">
      {shown.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className={`${sizeClass} rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white font-bold flex items-center justify-center ring-2 ring-white shrink-0`}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            (user.name || '?').charAt(0)
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className={`${sizeClass} rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center ring-2 ring-white`}>
          +{extra}
        </div>
      )}
    </div>
  );
}
