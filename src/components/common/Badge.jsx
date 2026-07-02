const colors = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-green-700 ring-green-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  accent: 'bg-purple-50 text-purple-700 ring-purple-200',
};

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, label }) {
  const colorMap = {
    ACTIVE: 'success', COMPLETED: 'success', APPROVED: 'success',
    DRAFT: 'default', ASSIGNED: 'default', NEW: 'default', TODO: 'default', PENDING: 'warning',
    IN_PROGRESS: 'info', SUBMITTED: 'warning', REVIEW: 'warning',
    REJECTED: 'danger', CANCELLED: 'danger', SUSPENDED: 'danger',
    URGENT: 'danger', HIGH: 'warning', MEDIUM: 'info',
  };
  return <Badge color={colorMap[status] || 'default'}>{label || status}</Badge>;
}

export function PriorityBadge({ priority, label }) {
  return <StatusBadge status={priority} label={label} />;
}
