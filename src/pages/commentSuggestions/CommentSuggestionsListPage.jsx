import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { commentSuggestionsService, boardsService, campaignsService, postLinksService, tasksService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import usePagination from '../../hooks/usePagination';
import useDebounce from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDateTime, truncateText, getApiErrorMessage } from '../../lib/formatters';

export default function CommentSuggestionsListPage() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const { page, limit, setPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [postLinkId, setPostLinkId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [tone, setTone] = useState('');
  const [language, setLanguage] = useState('');
  const [isActive, setIsActive] = useState('');
  const debouncedSearch = useDebounce(search);

  const params = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(boardId && { boardId: Number(boardId) }),
    ...(campaignId && { campaignId: Number(campaignId) }),
    ...(postLinkId && { postLinkId: Number(postLinkId) }),
    ...(taskId && { taskId: Number(taskId) }),
    ...(tone && { tone }),
    ...(language && { language }),
    ...(isActive !== '' && { isActive: isActive === 'true' }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['comment-suggestions', params],
    queryFn: () => commentSuggestionsService.list(params),
  });

  const { data: boardsData } = useQuery({ queryKey: ['boards-select'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data: campaignsData } = useQuery({ queryKey: ['campaigns-select'], queryFn: () => campaignsService.list({ limit: 100 }) });
  const { data: postLinksData } = useQuery({ queryKey: ['post-links-select'], queryFn: () => postLinksService.list({ limit: 100 }) });
  const { data: tasksData } = useQuery({ queryKey: ['tasks-select'], queryFn: () => tasksService.list({ limit: 100 }) });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive: active }) => commentSuggestionsService.updateActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-suggestions'] });
      toast.success('تم تحديث الحالة');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const suggestions = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'text', title: 'النص', render: (row) => truncateText(row.text, 60) },
    { key: 'tone', title: 'النبرة', render: (row) => STATUS_LABELS.commentTone[row.tone] || row.tone },
    { key: 'language', title: 'اللغة' },
    {
      key: 'scope',
      title: 'النطاق',
      render: (row) => {
        if (row.taskId) return `مهمة #${row.taskId}`;
        if (row.postLinkId) return `رابط #${row.postLinkId}`;
        if (row.campaignId) return `حملة #${row.campaignId}`;
        if (row.boardId) return `بورد #${row.boardId}`;
        return '—';
      },
    },
    {
      key: 'usage',
      title: 'الاستخدام',
      render: (row) => row.usageLimit != null ? `${row.usedCount}/${row.usageLimit}` : row.usedCount,
    },
    {
      key: 'isActive',
      title: 'الحالة',
      render: (row) => (
        <Badge color={row.isActive ? 'success' : 'default'}>{row.isActive ? 'نشط' : 'غير نشط'}</Badge>
      ),
    },
    { key: 'createdAt', title: 'التاريخ', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <div className="flex gap-2">
          {can('comment_suggestions.update') && (
            <>
              <Link to={ROUTES.COMMENT_SUGGESTION_EDIT(row.id)}>
                <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMutation.mutate({ id: row.id, isActive: !row.isActive })}
              >
                {row.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message="فشل تحميل اقتراحات التعليقات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="اقتراحات التعليقات"
        subtitle="إدارة اقتراحات التعليقات الجاهزة"
        action={
          can('comment_suggestions.create') && (
            <Link to={ROUTES.COMMENT_SUGGESTION_CREATE}>
              <Button><Plus size={18} /> إضافة اقتراح</Button>
            </Link>
          )
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="بحث في النص..." />
        </div>
        <Select label="البورد" value={boardId} onChange={(e) => { setBoardId(e.target.value); resetPage(); }} className="min-w-[130px]">
          <option value="">الكل</option>
          {(boardsData?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select label="الحملة" value={campaignId} onChange={(e) => { setCampaignId(e.target.value); resetPage(); }} className="min-w-[130px]">
          <option value="">الكل</option>
          {(campaignsData?.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="رابط المنشور" value={postLinkId} onChange={(e) => { setPostLinkId(e.target.value); resetPage(); }} className="min-w-[130px]">
          <option value="">الكل</option>
          {(postLinksData?.data || []).map((pl) => <option key={pl.id} value={pl.id}>{pl.title || pl.url}</option>)}
        </Select>
        <Select label="المهمة" value={taskId} onChange={(e) => { setTaskId(e.target.value); resetPage(); }} className="min-w-[130px]">
          <option value="">الكل</option>
          {(tasksData?.data || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </Select>
        <Select label="النبرة" value={tone} onChange={(e) => { setTone(e.target.value); resetPage(); }} className="min-w-[130px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.commentTone).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="اللغة" value={language} onChange={(e) => { setLanguage(e.target.value); resetPage(); }} placeholder="ar" className="min-w-[100px]" />
        <Select label="نشط" value={isActive} onChange={(e) => { setIsActive(e.target.value); resetPage(); }} className="min-w-[120px]">
          <option value="">الكل</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </Select>
      </FilterBar>

      <Table columns={columns} data={suggestions} loading={isLoading} emptyMessage="لا توجد اقتراحات" />
      <Pagination page={meta?.page || page} totalPages={meta?.totalPages} total={meta?.total} onPageChange={setPage} />
    </div>
  );
}
