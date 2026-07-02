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

export default function TeamsReportPage() {
  const { filters, setFilter, setDateRange, clearFilters, queryParams } = useReportFilters();
  const { data: boards } = useQuery({ queryKey: ['boards-list'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-teams', queryParams],
    queryFn: () => reportsService.getTeams(queryParams),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير الفرق" subtitle="أداء الفرق والأعضاء" />
      <ReportsNav />
      <FilterBar>
        <Select value={filters.boardId} onChange={(e) => setFilter('boardId', e.target.value)} className="min-w-[160px]">
          <option value="">كل البوردات</option>
          {(boards?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="min-w-[140px]">
          <option value="">كل الأنواع</option>
          {['LIKES', 'COMMENTS', 'SHARES', 'FOLLOWS', 'CUSTOM'].map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={setDateRange} />
        <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
        <ExportButton filename="تقرير-الفرق.csv" onExport={() => reportsService.exportTeams(queryParams, 'تقرير-الفرق.csv')} />
      </FilterBar>
      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : (
        <Table
          columns={[
            { key: 'teamName', title: 'الفريق' },
            { key: 'teamType', title: 'النوع', render: (r) => <Badge>{r.teamType}</Badge> },
            { key: 'membersCount', title: 'الأعضاء' },
            { key: 'assignmentsCount', title: 'التعيينات' },
            { key: 'approvedAssignments', title: 'معتمدة' },
            { key: 'rejectedAssignments', title: 'مرفوضة' },
            { key: 'completionPercentage', title: 'الإنجاز', render: (r) => `${r.completionPercentage}%` },
            { key: 'averageReviewTimeHours', title: 'متوسط المراجعة', render: (r) => `${r.averageReviewTimeHours?.toFixed?.(1) || 0} س` },
          ]}
          data={data || []}
        />
      )}
    </div>
  );
}
