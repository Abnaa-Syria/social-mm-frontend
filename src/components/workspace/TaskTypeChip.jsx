const TYPE_COLORS = {
  like: 'bg-pink-50 text-pink-700 ring-pink-200',
  comment: 'bg-blue-50 text-blue-700 ring-blue-200',
  share: 'bg-purple-50 text-purple-700 ring-purple-200',
  save: 'bg-amber-50 text-amber-700 ring-amber-200',
  follow: 'bg-teal-50 text-teal-700 ring-teal-200',
  review: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export default function TaskTypeChip({ name, slug, className = '' }) {
  const style = TYPE_COLORS[slug] || 'bg-gray-50 text-gray-700 ring-gray-200';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${style} ${className}`}>
      {name}
    </span>
  );
}
