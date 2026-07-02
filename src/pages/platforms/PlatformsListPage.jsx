import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { platformsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatNumber, getApiErrorMessage } from '../../lib/formatters';
import { ROUTES } from '../../config/routes';

export default function PlatformsListPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['platforms', page, limit, debouncedSearch, isActive],
    queryFn: () => platformsService.list({
      page,
      limit,
      search: debouncedSearch || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: platformsService.delete,
    onSuccess: () => {
      toast.success('تم حذف المنصة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => platformsService.updateActive(id, active),
    onSuccess: () => {
      toast.success('تم تحديث حالة المنصة');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => (
      <div className="flex items-center gap-2">
        {row.icon && <span>{row.icon}</span>}
        <span className="font-bold">{row.name}</span>
      </div>
    )},
    { key: 'slug', title: 'المعرّف' },
    { key: 'baseUrl', title: 'الرابط الأساسي', render: (row) => row.baseUrl || '—' },
    { key: 'postLinks', title: 'روابط المنشورات', render: (row) => formatNumber(row._count?.postLinks) },
    { key: 'isActive', title: 'الحالة', render: (row) => (
      <Badge color={row.isActive ? 'success' : 'default'}>{row.isActive ? 'نشطة' : 'غير نشطة'}</Badge>
    )},
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleMutation.mutate({ id: row.id, active: !row.isActive })}
        >
          {row.isActive ? 'تعطيل' : 'تفعيل'}
        </Button>
        <Link to={ROUTES.PLATFORM_EDIT(row.id)}>
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
        title="المنصات"
        subtitle="إدارة منصات السوشيال ميديا"
        action={
          <Link to={ROUTES.PLATFORM_CREATE}>
            <Button><Plus size={18} /> إضافة منصة</Button>
          </Link>
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو المعرّف..." />
        </div>
        <Select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} className="w-40">
          <option value="">كل الحالات</option>
          <option value="true">نشطة</option>
          <option value="false">غير نشطة</option>
        </Select>
      </FilterBar>

      <Table columns={columns} data={data?.data} loading={isLoading} emptyMessage="لا توجد منصات" />

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
        title="حذف المنصة"
        message="هل أنت متأكد من حذف هذه المنصة؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}
