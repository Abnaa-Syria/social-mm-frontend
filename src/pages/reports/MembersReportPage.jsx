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
import useReportFilters from '../../hooks/useReportFilters';
import { reportsService } from '../../services';
import { formatDateTime } from '../../lib/formatters';

export default function MembersReportPage() {
  const { filters, setFilter, setDateRange, clearFilters, queryParams } = useReportFilters();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-members', queryParams],
    queryFn: () => reportsService.getMembers(queryParams),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير الأعضاء" subtitle="أداء أعضاء الفرق" />
      <ReportsNav />
      <FilterBar>
        <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="min-w-[140px]">
          <option value="">كل الحالات</option>
          {['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={setDateRange} />
        <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
        <ExportButton filename="تقرير-الأعضاء.csv" onExport={() => reportsService.exportMembers(queryParams, 'تقرير-الأعضاء.csv')} />
      </FilterBar>
      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : (
        <Table
          columns={[
            { key: 'userName', title: 'العضو' },
            { key: 'userEmail', title: 'البريد' },
            { key: 'teamName', title: 'الفريق' },
            { key: 'assignedAssignments', title: 'مسندة' },
            { key: 'approvedAssignments', title: 'معتمدة' },
            { key: 'rejectedAssignments', title: 'مرفوضة' },
            { key: 'completionPercentage', title: 'الإنجاز', render: (r) => `${r.completionPercentage}%` },
            { key: 'latestActivityDate', title: 'آخر نشاط', render: (r) => r.latestActivityDate ? formatDateTime(r.latestActivityDate) : '-' },
          ]}
          data={data || []}
        />
      )}
    </div>
  );
}
