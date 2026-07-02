import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Megaphone, Link2, ClipboardList, Users, UsersRound, CheckCircle, Clock, XCircle } from 'lucide-react';
import { dashboardService } from '../../services';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/common/Card';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import { formatNumber } from '../../lib/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import useAuthStore from '../../store/authStore';

const COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#DC2626', '#6B7280'];

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الإحصائيات" onRetry={refetch} />;

  const isMemberView = stats?.scope === 'member';

  const assignmentChart = [
    { name: 'معلقة', value: stats?.assignments?.pending || 0 },
    { name: 'مُرسلة', value: stats?.assignments?.submitted || 0 },
    { name: 'معتمدة', value: stats?.assignments?.approved || 0 },
    { name: 'مرفوضة', value: stats?.assignments?.rejected || 0 },
  ].filter((d) => d.value > 0);

  const taskChart = [
    { name: 'مكتملة', value: stats?.completedTasks || 0 },
    { name: 'متأخرة', value: stats?.overdueTasks || 0 },
    { name: 'أخرى', value: Math.max(0, (stats?.totalTasks || 0) - (stats?.completedTasks || 0) - (stats?.overdueTasks || 0)) },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-l from-[#1E3A8A] to-[#7C3AED] !text-white border-0">
        <h1 className="text-2xl font-extrabold">
          {isMemberView ? `مرحباً ${user?.name || ''}` : 'مرحباً بك في لوحة التحكم'}
        </h1>
        <p className="text-blue-100 mt-2 text-sm">
          {isMemberView
            ? 'ملخص مهامك وتعييناتك الحالية'
            : 'نظرة شاملة على عمليات السوشيال ميديا والمهام الجارية'}
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isMemberView && (
          <>
            <StatCard title="إجمالي البوردات" value={formatNumber(stats?.totalBoards)} icon={LayoutGrid} color="blue" />
            <StatCard title="البوردات النشطة" value={formatNumber(stats?.activeBoards)} icon={LayoutGrid} color="teal" />
            <StatCard title="إجمالي الحملات" value={formatNumber(stats?.totalCampaigns)} icon={Megaphone} color="purple" />
            <StatCard title="الحملات النشطة" value={formatNumber(stats?.activeCampaigns)} icon={Megaphone} color="green" />
            <StatCard title="روابط المنشورات" value={formatNumber(stats?.totalPostLinks)} icon={Link2} color="blue" />
          </>
        )}
        <StatCard title={isMemberView ? 'تعييناتي' : 'إجمالي المهام'} value={formatNumber(stats?.totalTasks)} icon={ClipboardList} color="purple" />
        <StatCard title={isMemberView ? 'تعيينات مكتملة' : 'المهام المكتملة'} value={formatNumber(stats?.completedTasks)} icon={CheckCircle} color="green" />
        <StatCard title={isMemberView ? 'تعيينات متأخرة' : 'المهام المتأخرة'} value={formatNumber(stats?.overdueTasks)} icon={Clock} color="amber" />
        <StatCard title="تعيينات معلقة" value={formatNumber(stats?.assignments?.pending)} icon={Clock} color="amber" />
        <StatCard title="تعيينات معتمدة" value={formatNumber(stats?.assignments?.approved)} icon={CheckCircle} color="green" />
        <StatCard title="تعيينات مرفوضة" value={formatNumber(stats?.assignments?.rejected)} icon={XCircle} color="red" />
        {!isMemberView && (
          <>
            <StatCard title="الفرق" value={formatNumber(stats?.totalTeams)} icon={UsersRound} color="teal" />
            <StatCard title="المستخدمين" value={formatNumber(stats?.totalUsers)} icon={Users} color="blue" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">التعيينات حسب الحالة</h3>
          {assignmentChart.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assignmentChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {assignmentChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">لا توجد بيانات</p>}
        </Card>
        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">المهام</h3>
          {taskChart.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">لا توجد بيانات</p>}
        </Card>
      </div>

      <Card>
        <h3 className="font-extrabold text-gray-900 mb-4">النشاط الأخير</h3>
        <ActivityTimeline activities={stats?.recentActivity || []} />
      </Card>
    </div>
  );
}
