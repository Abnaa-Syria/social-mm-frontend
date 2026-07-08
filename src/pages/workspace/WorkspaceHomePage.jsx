import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Megaphone, ClipboardList, Clock, CheckCircle, Plus, Link2, UserCheck, Zap } from 'lucide-react';
import { workspaceService } from '../../services';
import useAuthStore from '../../store/authStore';
import usePermissions from '../../hooks/usePermissions';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import PageHelp from '../../components/common/PageHelp';
import Button from '../../components/common/Button';
import WorkspaceStatsCard from '../../components/workspace/WorkspaceStatsCard';
import BoardCard from '../../components/workspace/BoardCard';
import ReviewCard from '../../components/workspace/ReviewCard';
import AssignmentKanbanCard from '../../components/workspace/AssignmentKanbanCard';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import { ROUTES } from '../../config/routes';

export default function WorkspaceHomePage() {
  const { user } = useAuthStore();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workspace-overview'],
    queryFn: workspaceService.getOverview,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل مساحة العمل" onRetry={refetch} />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-8">
      <PageHelp pageKey="workspace" />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F172A] via-[#1E3A8A] to-[#7C3AED] text-white p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium">مساحة العمل</p>
          <h1 className="text-3xl font-extrabold mt-1">مرحباً، {user?.name}</h1>
          <p className="text-blue-100 mt-2 max-w-xl">نظرة سريعة على عمليات السوشيال ميديا اليوم — البوردات، المهام، والمراجعات.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {(can('post_links.create') && can('tasks.create')) && (
              <Link to={ROUTES.QUICK_START}>
                <Button className="!bg-amber-400 !text-[#0F172A] hover:!bg-amber-300 font-extrabold"><Zap size={16} /> إنشاء سريع</Button>
              </Link>
            )}
            {can('boards.create') && (
              <Link to={ROUTES.BOARD_CREATE}>
                <Button className="!bg-white !text-[#1E3A8A] hover:!bg-blue-50"><Plus size={16} /> إنشاء بورد جديد</Button>
              </Link>
            )}
            {can('post_links.create') && (
              <Link to={ROUTES.POST_LINK_CREATE}>
                <Button variant="ghost" className="!text-white !bg-white/10 hover:!bg-white/20"><Link2 size={16} /> أضف رابط منشور</Button>
              </Link>
            )}
            {can('task_assignments.approve') && (
              <Link to={ROUTES.REVIEWS}>
                <Button variant="ghost" className="!text-white !bg-white/10 hover:!bg-white/20"><UserCheck size={16} /> مراجعة التعيينات</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <WorkspaceStatsCard title="البوردات النشطة" value={stats.activeBoards} icon={LayoutGrid} color="blue" />
        <WorkspaceStatsCard title="الحملات الجارية" value={stats.activeCampaigns} icon={Megaphone} color="purple" />
        <WorkspaceStatsCard title="المهام المفتوحة" value={stats.openTasks} icon={ClipboardList} color="teal" />
        <WorkspaceStatsCard title="قيد المراجعة" value={stats.pendingReviews} icon={Clock} color="amber" />
        <WorkspaceStatsCard title="مهام متأخرة" value={stats.overdueTasks} icon={Clock} color="red" />
        <WorkspaceStatsCard title="نسبة الإنجاز" value={`${stats.completionRate || 0}%`} icon={CheckCircle} color="green" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">البوردات النشطة</h2>
          <Link to={ROUTES.BOARDS} className="text-sm font-bold text-[#2563EB] hover:underline">عرض الكل</Link>
        </div>
        {data?.boards?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">لا توجد بوردات نشطة حالياً</p>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {can('task_assignments.approve') && data?.reviewQueue?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900">قيد المراجعة</h2>
              <Link to={ROUTES.REVIEWS} className="text-sm font-bold text-[#2563EB] hover:underline">فتح قائمة المراجعة</Link>
            </div>
            <div className="space-y-4">
              {data.reviewQueue.slice(0, 3).map((a) => (
                <ReviewCard key={a.id} assignment={a} />
              ))}
            </div>
          </section>
        )}

        {data?.myTasks?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900">مهامي المعلقة</h2>
              <Link to={ROUTES.MY_WORK} className="text-sm font-bold text-[#2563EB] hover:underline">مساحة عملي</Link>
            </div>
            <div className="space-y-3">
              {data.myTasks.map((a) => (
                <AssignmentKanbanCard key={a.id} card={a} onOpen={() => navigate(ROUTES.ASSIGNMENT_DETAILS(a.id))} />
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">النشاط الأخير</h2>
        <ActivityTimeline activities={data?.recentActivity || []} />
      </section>
    </div>
  );
}
