import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersService, rolesService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateTime, formatStatus, getApiErrorMessage } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';
import { STATUS_LABELS } from '../../config/constants.js';

const STATUS_OPTIONS = Object.entries(STATUS_LABELS.user);

export default function UsersListPage() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const { page, limit, setPage, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roleId, setRoleId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data: rolesData } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit, debouncedSearch, status, roleId],
    queryFn: () =>
      usersService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        roleId: roleId || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersService.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => <span className="font-bold">{row.name}</span> },
    { key: 'email', title: 'البريد الإلكتروني' },
    { key: 'phone', title: 'الهاتف', render: (row) => row.phone || '—' },
    {
      key: 'role',
      title: 'الدور',
      render: (row) => row.role?.name || '—',
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => (
        <StatusBadge status={row.status} label={formatStatus(row.status, 'user')} />
      ),
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
          {can('users.view') && (
            <Link to={ROUTES.USER_DETAILS(row.id)}>
              <Button variant="ghost" size="sm" title="عرض">
                <Eye size={16} />
              </Button>
            </Link>
          )}
          {can('users.update') && (
            <Link to={ROUTES.USER_EDIT(row.id)}>
              <Button variant="ghost" size="sm" title="تعديل">
                <Pencil size={16} />
              </Button>
            </Link>
          )}
          {can('users.delete') && (
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
        title="المستخدمين"
        subtitle="إدارة حسابات المستخدمين والأدوار"
        action={
          can('users.create') && (
            <Link to={ROUTES.USER_CREATE}>
              <Button>
                <Plus size={18} />
                إضافة مستخدم
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
                placeholder="بحث بالاسم أو البريد..."
              />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            >
              <option value="">كل الحالات</option>
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            >
              <option value="">كل الأدوار</option>
              {(rolesData?.data || []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>

        <div className="p-4">
          <Table columns={columns} data={users} loading={isLoading} emptyMessage="لا يوجد مستخدمين" />
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
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
