import { STATUS_LABELS, STATUS_COLORS } from '../config/constants';

export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const formatStatus = (status, type = 'task') => {
  return STATUS_LABELS[type]?.[status] || status;
};

export const formatPriority = (priority) => STATUS_LABELS.priority[priority] || priority;

export const truncateText = (text, max = 50) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0);
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
};

export const getStatusColor = (status) => STATUS_COLORS[status] || 'default';

export const getPriorityColor = (priority) => STATUS_COLORS[priority] || 'default';

export const formatNumber = (num) => new Intl.NumberFormat('ar-EG').format(num || 0);

export const getApiErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join('، ');
  return data?.message || error?.message || 'حدث خطأ غير متوقع';
};
