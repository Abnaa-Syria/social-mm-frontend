import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { taskTypesService } from '../../services/index.js';
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

export default function TaskTypesListPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['task-types', page, limit, debouncedSearch, isActive],
    queryFn: () => taskTypesService.list({
      page,
      limit,
      search: debouncedSearch || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: taskTypesService.delete,
    onSuccess: () => {
      toast.success('تم حذف نوع المهمة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['task-types'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => taskTypesService.updateActive(id, active),
    onSuccess: () => {
      toast.success('تم تحديث حالة نوع المهمة');
      queryClient.invalidateQueries({ queryKey: ['task-types'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => <span className="font-bold">{row.name}</span> },
    { key: 'slug', title: 'المعرّف' },
    { key: 'requiresComment', title: 'يتطلب تعليق', render: (row) => (
      <Badge color={row.requiresComment ? 'info' : 'default'}>{row.requiresComment ? 'نعم' : 'لا'}</Badge>
    )},
    { key: 'requiresProof', title: 'يتطلب إثبات', render: (row) => (
      <Badge color={row.requiresProof ? 'info' : 'default'}>{row.requiresProof ? 'نعم' : 'لا'}</Badge>
    )},
    { key: 'tasks', title: 'المهام', render: (row) => formatNumber(row._count?.tasks) },
    { key: 'isActive', title: 'الحالة', render: (row) => (
      <Badge color={row.isActive ? 'success' : 'default'}>{row.isActive ? 'نشط' : 'غير نشط'}</Badge>
    )},
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <div className="flex items-center gap-2">
        {!row.isSystem && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMutation.mutate({ id: row.id, active: !row.isActive })}
            >
              {row.isActive ? 'تعطيل' : 'تفعيل'}
            </Button>
            <Link to={ROUTES.TASK_TYPE_EDIT(row.id)}>
              <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </>
        )}
        {row.isSystem && <Badge color="accent">نظام</Badge>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="أنواع المهام"
        subtitle="إدارة أنواع المهام المتاحة"
        action={
          <Link to={ROUTES.TASK_TYPE_CREATE}>
            <Button><Plus size={18} /> إضافة نوع مهمة</Button>
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

      <Table columns={columns} data={data?.data} loading={isLoading} emptyMessage="لا توجد أنواع مهام" />

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
        title="حذف نوع المهمة"
        message="هل أنت متأكد من حذف نوع المهمة هذا؟"
      />
    </div>
  );
}
