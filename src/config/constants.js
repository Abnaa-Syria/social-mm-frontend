export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'منصة إدارة عمليات السوشيال ميديا';

export const TOKEN_KEY = 'social_ops_token';
export const USER_KEY = 'social_ops_user';

export const PAGE_SIZE = 10;

export const STATUS_LABELS = {
  board: { ACTIVE: 'نشط', ARCHIVED: 'مؤرشف' },
  campaign: { DRAFT: 'مسودة', ACTIVE: 'نشطة', PAUSED: 'متوقفة مؤقتًا', COMPLETED: 'مكتملة', ARCHIVED: 'مؤرشفة' },
  postLink: { NEW: 'جديد', IN_PROGRESS: 'قيد التنفيذ', REVIEW: 'قيد المراجعة', COMPLETED: 'مكتمل', CANCELLED: 'ملغي' },
  task: { TODO: 'لم يبدأ', IN_PROGRESS: 'قيد التنفيذ', REVIEW: 'قيد المراجعة', COMPLETED: 'مكتملة', CANCELLED: 'ملغية' },
  assignment: { ASSIGNED: 'تم التعيين', IN_PROGRESS: 'قيد التنفيذ', SUBMITTED: 'تم الإرسال', APPROVED: 'معتمد', REJECTED: 'مرفوض', CANCELLED: 'ملغي' },
  proof: { PENDING: 'قيد الانتظار', APPROVED: 'معتمد', REJECTED: 'مرفوض' },
  user: { ACTIVE: 'نشط', INACTIVE: 'غير نشط', SUSPENDED: 'موقوف' },
  priority: { LOW: 'منخفضة', MEDIUM: 'متوسطة', HIGH: 'عالية', URGENT: 'عاجلة' },
  teamType: { LIKES: 'لايكات', COMMENTS: 'تعليقات', SHARES: 'مشاركات', SAVES: 'حفظ', FOLLOWS: 'متابعة', REVIEWS: 'مراجعات', CUSTOM: 'مخصص' },
  commentTone: { FRIENDLY: 'ودي', FORMAL: 'رسمي', FUNNY: 'مرح', PROMOTIONAL: 'ترويجي', NEUTRAL: 'محايد', CUSTOM: 'مخصص' },
  proofType: { SCREENSHOT: 'لقطة شاشة', URL: 'رابط', TEXT: 'نص', FILE: 'ملف' },
};

export const MODULE_LABELS = {
  users: 'المستخدمين',
  roles: 'الأدوار',
  permissions: 'الصلاحيات',
  settings: 'الإعدادات',
  audit_logs: 'سجل التدقيق',
  dashboard: 'لوحة التحكم',
  boards: 'البوردات',
  campaigns: 'الحملات',
  platforms: 'المنصات',
  teams: 'الفرق',
  team_members: 'أعضاء الفريق',
  post_links: 'روابط المنشورات',
  task_types: 'أنواع المهام',
  tasks: 'المهام',
  task_assignments: 'التعيينات',
  comment_suggestions: 'اقتراحات التعليقات',
  proofs: 'إثباتات التنفيذ',
  dashboard_stats: 'إحصائيات اللوحة',
};

export const STATUS_COLORS = {
  ACTIVE: 'success', COMPLETED: 'success', APPROVED: 'success',
  DRAFT: 'default', ASSIGNED: 'default', NEW: 'default', TODO: 'default', PENDING: 'warning',
  IN_PROGRESS: 'info', SUBMITTED: 'warning', REVIEW: 'warning', PAUSED: 'warning',
  REJECTED: 'danger', CANCELLED: 'danger', SUSPENDED: 'danger', INACTIVE: 'default',
  ARCHIVED: 'default', URGENT: 'danger', HIGH: 'warning', MEDIUM: 'info', LOW: 'default',
};
