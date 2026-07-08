import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Pencil } from 'lucide-react';
import { tasksService, boardsService, campaignsService, postLinksService, taskTypesService, teamsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import PageHelp from '../../components/common/PageHelp';
import FilterBar from '../../components/common/FilterBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import usePagination from '../../hooks/usePagination';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate, formatStatus, formatPriority } from '../../lib/formatters';

export default function TasksListPage() {
  const { can } = usePermissions();
  const { page, limit, setPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [postLinkId, setPostLinkId] = useState('');
  const [taskTypeId, setTaskTypeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const debouncedSearch = useDebounce(search);

  const params = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(boardId && { boardId: Number(boardId) }),
    ...(campaignId && { campaignId: Number(campaignId) }),
    ...(postLinkId && { postLinkId: Number(postLinkId) }),
    ...(taskTypeId && { taskTypeId: Number(taskTypeId) }),
    ...(teamId && { teamId: Number(teamId) }),
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksService.list(params),
  });

  const { data: boardsData } = useQuery({ queryKey: ['boards-select'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data: campaignsData } = useQuery({ queryKey: ['campaigns-select'], queryFn: () => campaignsService.list({ limit: 100 }) });
  const { data: postLinksData } = useQuery({ queryKey: ['post-links-select'], queryFn: () => postLinksService.list({ limit: 100 }) });
  const { data: taskTypesData } = useQuery({ queryKey: ['task-types-select'], queryFn: () => taskTypesService.list({ limit: 100 }) });
  const { data: teamsData } = useQuery({ queryKey: ['teams-select'], queryFn: () => teamsService.list({ limit: 100 }) });

  const tasks = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'title', title: 'العنوان' },
    { key: 'postLink', title: 'رابط المنشور', render: (row) => row.postLink?.title || row.postLink?.url || '—' },
    { key: 'taskType', title: 'نوع المهمة', render: (row) => row.taskType?.name || '—' },
    { key: 'team', title: 'الفريق', render: (row) => row.team?.name || '—' },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => <StatusBadge status={row.status} label={formatStatus(row.status, 'task')} />,
    },
    {
      key: 'priority',
      title: 'الأولوية',
      render: (row) => <PriorityBadge priority={row.priority} label={formatPriority(row.priority)} />,
    },
    {
      key: 'progress',
      title: 'التقدم',
      render: (row) => `${row.completedCount || 0} / ${row.targetCount || 0}`,
    },
    { key: 'dueDate', title: 'الاستحقاق', render: (row) => formatDate(row.dueDate) },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={ROUTES.TASK_DETAILS(row.id)}>
            <Button variant="ghost" size="sm"><Eye size={16} /></Button>
          </Link>
          {can('tasks.update') && (
            <Link to={ROUTES.TASK_EDIT(row.id)}>
              <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message="فشل تحميل المهام" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="المهام"
        subtitle="إدارة مهام التفاعل على المنشورات"
        action={
          can('tasks.create') && (
            <Link to={ROUTES.TASK_CREATE}>
              <Button><Plus size={18} /> إضافة مهمة</Button>
            </Link>
          )
        }
      />

      <PageHelp pageKey="tasks" />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="بحث..." />
        </div>
        <Select label="البورد" value={boardId} onChange={(e) => { setBoardId(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {(boardsData?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select label="الحملة" value={campaignId} onChange={(e) => { setCampaignId(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {(campaignsData?.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="رابط المنشور" value={postLinkId} onChange={(e) => { setPostLinkId(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {(postLinksData?.data || []).map((pl) => <option key={pl.id} value={pl.id}>{pl.title || pl.url}</option>)}
        </Select>
        <Select label="نوع المهمة" value={taskTypeId} onChange={(e) => { setTaskTypeId(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {(taskTypesData?.data || []).map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
        </Select>
        <Select label="الفريق" value={teamId} onChange={(e) => { setTeamId(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {(teamsData?.data || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
        <Select label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.task).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select label="الأولوية" value={priority} onChange={(e) => { setPriority(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.priority).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </FilterBar>

      <Table columns={columns} data={tasks} loading={isLoading} emptyMessage="لا توجد مهام" />
      <Pagination page={meta?.page || page} totalPages={meta?.totalPages} total={meta?.total} onPageChange={setPage} />
    </div>
  );
}
