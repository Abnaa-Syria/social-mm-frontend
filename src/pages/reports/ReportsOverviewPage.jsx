import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Megaphone, ClipboardList, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ReportsNav from '../../components/reports/ReportsNav';
import StatCard from '../../components/charts/StatCard';
import Card from '../../components/common/Card';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { reportsService } from '../../services';
import { formatNumber } from '../../lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#DC2626', '#8B5CF6'];

export default function ReportsOverviewPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: reportsService.getOverview,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل التقرير" onRetry={refetch} />;

  const assignmentData = [
    { name: 'معتمدة', value: data?.approvedAssignments || 0 },
    { name: 'مرفوضة', value: data?.rejectedAssignments || 0 },
    { name: 'إجمالي', value: Math.max(0, (data?.totalAssignments || 0) - (data?.approvedAssignments || 0) - (data?.rejectedAssignments || 0)) },
  ].filter((d) => d.value > 0);

  const taskData = [
    { name: 'مكتملة', value: data?.completedTasks || 0 },
    { name: 'معلقة', value: data?.pendingTasks || 0 },
    { name: 'متأخرة', value: data?.overdueTasks || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="التقارير" subtitle="نظرة تحليلية شاملة على العمليات" />
      <ReportsNav />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي البوردات" value={formatNumber(data?.totalBoards)} icon={LayoutGrid} color="blue" />
        <StatCard title="الحملات النشطة" value={formatNumber(data?.activeCampaigns)} icon={Megaphone} color="purple" />
        <StatCard title="إجمالي المهام" value={formatNumber(data?.totalTasks)} icon={ClipboardList} color="teal" />
        <StatCard title="نسبة الإنجاز" value={`${data?.completionPercentage || 0}%`} icon={TrendingUp} color="green" />
        <StatCard title="المهام المكتملة" value={formatNumber(data?.completedTasks)} icon={CheckCircle} color="green" />
        <StatCard title="المهام المتأخرة" value={formatNumber(data?.overdueTasks)} icon={Clock} color="amber" />
        <StatCard title="التعيينات المعتمدة" value={formatNumber(data?.approvedAssignments)} icon={CheckCircle} color="blue" />
        <StatCard title="المستخدمين" value={formatNumber(data?.totalUsers)} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-extrabold mb-4">التعيينات</h3>
          {assignmentData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={assignmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {assignmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">لا توجد بيانات</p>}
        </Card>
        <Card>
          <h3 className="font-extrabold mb-4">المهام</h3>
          {taskData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={taskData}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">متوسط وقت الاعتماد</span><p className="font-bold mt-1">{data?.averageApprovalTimeHours?.toFixed?.(1) || 0} ساعة</p></div>
          <div><span className="text-gray-500">الفرق النشطة</span><p className="font-bold mt-1">{formatNumber(data?.activeTeams)}</p></div>
          <div><span className="text-gray-500">روابط المنشورات</span><p className="font-bold mt-1">{formatNumber(data?.totalPostLinks)}</p></div>
          <div><span className="text-gray-500">إجمالي التعيينات</span><p className="font-bold mt-1">{formatNumber(data?.totalAssignments)}</p></div>
        </div>
      </Card>
    </div>
  );
}
