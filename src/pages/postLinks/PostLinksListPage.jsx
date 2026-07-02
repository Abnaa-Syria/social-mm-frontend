import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Pencil } from 'lucide-react';
import { postLinksService, campaignsService, platformsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import usePagination from '../../hooks/usePagination';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate, formatStatus, truncateText } from '../../lib/formatters';

export default function PostLinksListPage() {
  const { can } = usePermissions();
  const { page, limit, setPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search);

  const params = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(campaignId && { campaignId: Number(campaignId) }),
    ...(platformId && { platformId: Number(platformId) }),
    ...(status && { status }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['post-links', params],
    queryFn: () => postLinksService.list(params),
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns-select'],
    queryFn: () => campaignsService.list({ limit: 100 }),
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms-select'],
    queryFn: () => platformsService.list({ limit: 100 }),
  });

  const campaigns = campaignsData?.data || [];
  const platforms = platformsData?.data || [];
  const postLinks = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'title', title: 'العنوان', render: (row) => row.title || truncateText(row.url, 40) },
    { key: 'campaign', title: 'الحملة', render: (row) => row.campaign?.name || '—' },
    { key: 'platform', title: 'المنصة', render: (row) => row.platform?.name || '—' },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => <StatusBadge status={row.status} label={formatStatus(row.status, 'postLink')} />,
    },
    { key: 'dueDate', title: 'تاريخ الاستحقاق', render: (row) => formatDate(row.dueDate) },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={ROUTES.POST_LINK_DETAILS(row.id)}>
            <Button variant="ghost" size="sm"><Eye size={16} /></Button>
          </Link>
          {can('post_links.update') && (
            <Link to={ROUTES.POST_LINK_EDIT(row.id)}>
              <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message="فشل تحميل روابط المنشورات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="روابط المنشورات"
        subtitle="إدارة روابط المنشورات المرتبطة بالحملات"
        action={
          can('post_links.create') && (
            <Link to={ROUTES.POST_LINK_CREATE}>
              <Button><Plus size={18} /> إضافة رابط</Button>
            </Link>
          )
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="بحث بالعنوان أو الرابط..." />
        </div>
        <Select
          label="الحملة"
          value={campaignId}
          onChange={(e) => { setCampaignId(e.target.value); resetPage(); }}
          className="min-w-[160px]"
        >
          <option value="">كل الحملات</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select
          label="المنصة"
          value={platformId}
          onChange={(e) => { setPlatformId(e.target.value); resetPage(); }}
          className="min-w-[160px]"
        >
          <option value="">كل المنصات</option>
          {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select
          label="الحالة"
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage(); }}
          className="min-w-[160px]"
        >
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS.postLink).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </FilterBar>

      <Table columns={columns} data={postLinks} loading={isLoading} emptyMessage="لا توجد روابط منشورات" />
      <Pagination
        page={meta?.page || page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPageChange={setPage}
      />
    </div>
  );
}
