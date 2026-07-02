import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import ReportsNav from '../../components/reports/ReportsNav';
import FilterBar from '../../components/common/FilterBar';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ExportButton from '../../components/common/ExportButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import useReportFilters from '../../hooks/useReportFilters';
import { reportsService } from '../../services';
import StatCard from '../../components/charts/StatCard';
import { Activity, List } from 'lucide-react';
import { formatNumber } from '../../lib/formatters';

export default function ActivityReportPage() {
  const { filters, setDateRange, clearFilters, queryParams } = useReportFilters();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-activity', queryParams],
    queryFn: () => reportsService.getActivity(queryParams),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="تقرير النشاطات" subtitle="ملخص النشاط والجدول الزمني" />
      <ReportsNav />
      <FilterBar>
        <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={setDateRange} />
        <Button variant="ghost" onClick={clearFilters}>مسح الفلاتر</Button>
        <ExportButton filename="تقرير-النشاطات.csv" onExport={() => reportsService.exportActivity(queryParams, 'تقرير-النشاطات.csv')} />
      </FilterBar>
      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="إجمالي النشاطات" value={formatNumber(data?.meta?.total || data?.timeline?.length || 0)} icon={Activity} color="blue" />
            <StatCard title="أنواع الإجراءات" value={formatNumber(Object.keys(data?.summary || {}).length)} icon={List} color="purple" />
            <StatCard title="أحدث النشاط" value={data?.timeline?.[0]?.action || '—'} icon={Activity} color="teal" />
          </div>
          <Card>
            <h3 className="font-extrabold mb-4">الجدول الزمني</h3>
            <ActivityTimeline activities={data?.timeline || []} />
          </Card>
        </>
      )}
    </div>
  );
}
