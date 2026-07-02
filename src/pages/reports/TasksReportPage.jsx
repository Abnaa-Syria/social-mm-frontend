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
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import useReportFilters from '../../hooks/useReportFilters';
import { reportsService, boardsService } from '../../services';
import { formatDateTime } from '../../lib/formatters';

export default function TasksReportPage() {
  const { filters, setFilter, setDateRange, clearFilters, queryParams } = useReportFilters();
  const { data: boards } = useQuery({ queryKey: ['boards-list'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-tasks', queryParams],
    queryFn: () => reportsService.getTasks(queryParams),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير المهام" subtitle="تحليل المهام والتقدم" />
      <ReportsNav />
      <FilterBar>
        <Select value={filters.boardId} onChange={(e) => setFilter('boardId', e.target.value)} className="min-w-[160px]">
          <option value="">كل البوردات</option>
          {(boards?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="min-w-[140px]">
          <option value="">كل الحالات</option>
          {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} className="min-w-[140px]">
          <option value="">كل الأولويات</option>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={setDateRange} />
        <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
        <ExportButton filename="تقرير-المهام.csv" onExport={() => reportsService.exportTasks(queryParams, 'تقرير-المهام.csv')} />
      </FilterBar>
      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : (
        <Table
          columns={[
            { key: 'title', title: 'المهمة' },
            { key: 'campaignName', title: 'الحملة' },
            { key: 'taskType', title: 'النوع' },
            { key: 'teamName', title: 'الفريق' },
            { key: 'status', title: 'الحالة', render: (r) => <Badge>{r.status}</Badge> },
            { key: 'completionPercentage', title: 'الإنجاز', render: (r) => `${r.completionPercentage}%` },
            { key: 'dueDate', title: 'الاستحقاق', render: (r) => r.dueDate ? formatDateTime(r.dueDate) : '-' },
            { key: 'overdue', title: 'متأخرة', render: (r) => r.overdue ? 'نعم' : 'لا' },
          ]}
          data={data || []}
        />
      )}
    </div>
  );
}
