import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Eye, Pencil, Trash2, LayoutGrid, Table2 } from 'lucide-react';
import { boardsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BoardCard from '../../components/workspace/BoardCard';
import EmptyBoardState from '../../components/workspace/EmptyBoardState';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatStatus, formatNumber, getApiErrorMessage } from '../../lib/formatters';
import { STATUS_LABELS } from '../../config/constants';
import { ROUTES } from '../../config/routes';

export default function BoardsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['boards', page, limit, debouncedSearch, status, viewMode],
    queryFn: () => boardsService.list({
      page,
      limit: viewMode === 'cards' ? 24 : limit,
      search: debouncedSearch || undefined,
      status: status || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: boardsService.delete,
    onSuccess: () => {
      toast.success('تم حذف البورد بنجاح');
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => (
      <div className="flex items-center gap-2">
        {row.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
        <span className="font-bold">{row.name}</span>
      </div>
    )},
    { key: 'status', title: 'الحالة', render: (row) => (
      <StatusBadge status={row.status} label={formatStatus(row.status, 'board')} />
    )},
    { key: 'campaigns', title: 'الحملات', render: (row) => formatNumber(row._count?.campaigns) },
    { key: 'teams', title: 'الفرق', render: (row) => formatNumber(row._count?.teams) },
    { key: 'createdBy', title: 'أنشأه', render: (row) => row.createdBy?.name || '—' },
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <div className="flex items-center gap-2">
        <Link to={ROUTES.BOARD_DETAILS(row.id)}>
          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
        </Link>
        <Link to={ROUTES.BOARD_EDIT(row.id)}>
          <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="البوردات"
        subtitle="إدارة بوردات العمل والحملات"
        action={
          <Link to={ROUTES.BOARD_CREATE}>
            <Button><Plus size={18} /> إضافة بورد</Button>
          </Link>
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث في البوردات..." />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS.board).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button type="button" onClick={() => setViewMode('cards')} className={`px-3 py-2 text-sm font-bold flex items-center gap-1 ${viewMode === 'cards' ? 'bg-[#2563EB] text-white' : 'bg-white text-gray-600'}`}>
            <LayoutGrid size={16} /> كروت
          </button>
          <button type="button" onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm font-bold flex items-center gap-1 ${viewMode === 'table' ? 'bg-[#2563EB] text-white' : 'bg-white text-gray-600'}`}>
            <Table2 size={16} /> جدول
          </button>
        </div>
      </FilterBar>

      {viewMode === 'cards' ? (
        isLoading ? (
          <p className="text-center py-12 text-gray-500">جاري التحميل...</p>
        ) : data?.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.data.map((board) => (
              <BoardCard
                key={board.id}
                board={{
                  ...board,
                  campaignsCount: board._count?.campaigns,
                  teamsCount: board._count?.teams,
                  progress: 0,
                }}
                onEdit={(b) => navigate(ROUTES.BOARD_EDIT(b.id))}
              />
            ))}
          </div>
        ) : (
          <EmptyBoardState
            title="لا توجد بوردات بعد"
            description="ابدأ بتنظيم حملتك الأولى بإنشاء بورد جديد"
            actionLabel="إنشاء بورد جديد"
            onAction={() => navigate(ROUTES.BOARD_CREATE)}
          />
        )
      ) : (
        <Table columns={columns} data={data?.data} loading={isLoading} emptyMessage="لا توجد بوردات" />
      )}

      <Pagination
        page={page}
        totalPages={data?.meta?.totalPages}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="حذف البورد"
        message="هل أنت متأكد من حذف هذا البورد؟ سيتم أرشفته مع جميع البيانات المرتبطة."
      />
    </div>
  );
}
