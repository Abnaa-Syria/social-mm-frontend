import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import ReportsNav from '../../components/reports/ReportsNav';
import FilterBar from '../../components/common/FilterBar';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import Select from '../../components/common/Select';
import ExportButton from '../../components/common/ExportButton';
import Table from '../../components/common/Table';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import useReportFilters from '../../hooks/useReportFilters';
import { reportsService, boardsService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/common/Card';

export default function CampaignsReportPage() {
  const { filters, setFilter, setDateRange, clearFilters, queryParams } = useReportFilters();

  const { data: boards } = useQuery({ queryKey: ['boards-list'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-campaigns', queryParams],
    queryFn: () => reportsService.getCampaigns(queryParams),
  });

  const rows = data || [];
  const chartData = rows.slice(0, 8).map((r) => ({ name: r.campaignName?.slice(0, 12), completion: r.completionPercentage }));

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير الحملات" subtitle="تحليل أداء الحملات والتقدم" />
      <ReportsNav />

      <FilterBar>
        <Select value={filters.boardId} onChange={(e) => setFilter('boardId', e.target.value)} className="min-w-[160px]">
          <option value="">كل البوردات</option>
          {(boards?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="min-w-[140px]">
          <option value="">كل الحالات</option>
          {['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} className="min-w-[140px]">
          <option value="">كل الأولويات</option>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={setDateRange} />
        <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
        <ExportButton filename="تقرير-الحملات.csv" onExport={() => reportsService.exportCampaigns(queryParams, 'تقرير-الحملات.csv')} />
      </FilterBar>

      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : (
        <>
          {chartData.length > 0 && (
            <Card>
              <h3 className="font-extrabold mb-4">نسبة الإنجاز حسب الحملة</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {!rows.length ? <EmptyState title="لا توجد بيانات" /> : (
            <Table
              columns={[
                { key: 'campaignName', title: 'الحملة' },
                { key: 'boardName', title: 'البورد' },
                { key: 'status', title: 'الحالة', render: (r) => <Badge>{r.status}</Badge> },
                { key: 'totalTasks', title: 'المهام' },
                { key: 'completedTasks', title: 'مكتملة' },
                { key: 'completionPercentage', title: 'الإنجاز', render: (r) => `${r.completionPercentage}%` },
                { key: 'approvedAssignments', title: 'معتمدة' },
                { key: 'rejectedAssignments', title: 'مرفوضة' },
              ]}
              data={rows}
            />
          )}
        </>
      )}
    </div>
  );
}
