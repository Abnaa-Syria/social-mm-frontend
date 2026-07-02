import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { rolesService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { formatDateTime, getApiErrorMessage } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';

export default function RolesListPage() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const { page, limit, setPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, limit, debouncedSearch],
    queryFn: () =>
      rolesService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesService.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الدور بنجاح');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const roles = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => <span className="font-bold">{row.name}</span> },
    { key: 'slug', title: 'المعرّف', render: (row) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.slug}</code> },
    {
      key: 'isSystem',
      title: 'النوع',
      render: (row) => (
        <Badge color={row.isSystem ? 'accent' : 'default'}>
          {row.isSystem ? 'نظامي' : 'مخصص'}
        </Badge>
      ),
    },
    {
      key: 'users',
      title: 'المستخدمين',
      render: (row) => row._count?.users ?? 0,
    },
    {
      key: 'permissions',
      title: 'الصلاحيات',
      render: (row) => row._count?.rolePermissions ?? 0,
    },
    {
      key: 'createdAt',
      title: 'تاريخ الإنشاء',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-1">
          {can('roles.update') && (
            <>
              <Link to={ROUTES.ROLE_EDIT(row.id)}>
                <Button variant="ghost" size="sm" title="تعديل">
                  <Pencil size={16} />
                </Button>
              </Link>
              <Link to={ROUTES.ROLE_PERMISSIONS(row.id)}>
                <Button variant="ghost" size="sm" title="الصلاحيات">
                  <KeyRound size={16} />
                </Button>
              </Link>
            </>
          )}
          {can('roles.delete') && !row.isSystem && (
            <Button variant="ghost" size="sm" title="حذف" onClick={() => setDeleteTarget(row)}>
              <Trash2 size={16} className="text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="الأدوار"
        subtitle="إدارة أدوار المستخدمين وصلاحياتهم"
        action={
          can('roles.create') && (
            <Link to={ROUTES.ROLE_CREATE}>
              <Button>
                <Plus size={18} />
                إضافة دور
              </Button>
            </Link>
          )
        }
      />

      <Card padding={false} className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FilterBar>
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  resetPage();
                }}
                placeholder="بحث بالاسم أو المعرّف..."
              />
            </div>
          </FilterBar>
        </div>

        <div className="p-4">
          <Table columns={columns} data={roles} loading={isLoading} emptyMessage="لا توجد أدوار" />
          <Pagination
            page={meta?.page || page}
            totalPages={meta?.totalPages || 1}
            total={meta?.total || 0}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="حذف الدور"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
