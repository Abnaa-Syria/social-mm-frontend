import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, UserPlus, Trash2 } from 'lucide-react';
import { teamsService, usersService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { formatDate, getApiErrorMessage } from '../../lib/formatters';
import { STATUS_LABELS } from '../../config/constants';
import { ROUTES } from '../../config/routes';

const ROLE_LABELS = { LEADER: 'قائد', MEMBER: 'عضو' };

const addMembersSchema = z.object({
  role: z.enum(['LEADER', 'MEMBER']).default('MEMBER'),
});

export default function TeamDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const { data: team, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsService.get(id),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'active'],
    queryFn: () => usersService.list({ limit: 100, status: 'ACTIVE' }),
    enabled: addModalOpen,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addMembersSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const existingMemberIds = new Set((team?.members || []).map((m) => m.userId));
  const availableUsers = (usersData?.data || []).filter((u) => !existingMemberIds.has(u.id));

  const addMembersMutation = useMutation({
    mutationFn: (data) => teamsService.addMembers(id, data),
    onSuccess: () => {
      toast.success('تمت إضافة الأعضاء بنجاح');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      setAddModalOpen(false);
      setSelectedUserIds([]);
      reset({ role: 'MEMBER' });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }) => teamsService.updateMember(memberId, { role }),
    onSuccess: () => {
      toast.success('تم تحديث دور العضو');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeMemberMutation = useMutation({
    mutationFn: teamsService.removeMember,
    onSuccess: () => {
      toast.success('تم إزالة العضو');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      setRemoveMemberId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((uid) => uid !== userId) : [...prev, userId]
    );
  };

  const onAddMembers = (formData) => {
    if (selectedUserIds.length === 0) {
      toast.error('اختر عضواً واحداً على الأقل');
      return;
    }
    addMembersMutation.mutate({ userIds: selectedUserIds, role: formData.role });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل تفاصيل الفريق" onRetry={refetch} />;

  const memberColumns = [
    { key: 'name', title: 'الاسم', render: (row) => (
      <span className="font-bold">{row.user?.name}</span>
    )},
    { key: 'email', title: 'البريد', render: (row) => row.user?.email },
    { key: 'role', title: 'الدور', render: (row) => (
      <Select
        value={row.role}
        onChange={(e) => updateMemberMutation.mutate({ memberId: row.id, role: e.target.value })}
        className="w-32 py-1.5"
      >
        {Object.entries(ROLE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>
    )},
    { key: 'joinedAt', title: 'تاريخ الانضمام', render: (row) => formatDate(row.joinedAt) },
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <Button variant="ghost" size="sm" onClick={() => setRemoveMemberId(row.id)}>
        <Trash2 size={16} className="text-red-500" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        subtitle={team.description || 'تفاصيل الفريق'}
        action={
          <div className="flex gap-2">
            <Link to={ROUTES.TEAM_EDIT(id)}>
              <Button variant="secondary"><Pencil size={16} /> تعديل</Button>
            </Link>
            <Button onClick={() => setAddModalOpen(true)}><UserPlus size={16} /> إضافة أعضاء</Button>
          </div>
        }
      />

      <Card className="flex flex-wrap items-center gap-4">
        {team.color && <span className="w-6 h-6 rounded-full" style={{ backgroundColor: team.color }} />}
        <Badge color="info">{STATUS_LABELS.teamType[team.type] || team.type}</Badge>
        <Badge color={team.isActive ? 'success' : 'default'}>{team.isActive ? 'نشط' : 'غير نشط'}</Badge>
        {team.board && <span className="text-sm text-gray-500">البورد: {team.board.name}</span>}
        {team.leader && <span className="text-sm text-gray-500">القائد: {team.leader.name}</span>}
      </Card>

      <div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">الأعضاء ({team.members?.length || 0})</h3>
        <Table
          columns={memberColumns}
          data={team.members}
          emptyMessage="لا يوجد أعضاء في هذا الفريق"
        />
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="إضافة أعضاء" size="lg">
        <form onSubmit={handleSubmit(onAddMembers)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اختر المستخدمين</label>
            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">لا يوجد مستخدمون متاحون</p>
              ) : (
                availableUsers.map((user) => (
                  <label key={user.id} className="flex items-center gap-3 p-3 hover:bg-blue-50/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <Select label="الدور" error={errors.role?.message} {...register('role')}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>إلغاء</Button>
            <Button
              type="submit"
              loading={addMembersMutation.isPending}
              disabled={selectedUserIds.length === 0}
            >
              إضافة ({selectedUserIds.length})
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeMemberId}
        onClose={() => setRemoveMemberId(null)}
        onConfirm={() => removeMemberMutation.mutate(removeMemberId)}
        loading={removeMemberMutation.isPending}
        title="إزالة العضو"
        message="هل أنت متأكد من إزالة هذا العضو من الفريق؟"
      />
    </div>
  );
}
