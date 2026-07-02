import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Megaphone, UsersRound, Settings, BarChart3, LayoutGrid } from 'lucide-react';
import { workspaceService, campaignsService, teamsService, postLinksService } from '../../services';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import BoardHeader from '../../components/workspace/BoardHeader';
import KanbanBoard from '../../components/workspace/KanbanBoard';
import PostLinkKanbanCard from '../../components/workspace/PostLinkKanbanCard';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatNumber } from '../../lib/formatters';

const TABS = [
  { id: 'board', label: 'البورد' },
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'campaigns', label: 'الحملات' },
  { id: 'teams', label: 'الفرق' },
  { id: 'activity', label: 'النشاطات' },
];

export default function BoardDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('board');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['board-kanban', id],
    queryFn: () => workspaceService.getBoardKanban(id),
  });

  const kanbanMutation = useMutation({
    mutationFn: (updates) => Promise.all(
      updates.map((update) => postLinksService.reorder({
        status: update.columnId,
        orderedIds: update.orderedIds,
      })),
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-kanban', id] });
    },
    onError: () => toast.error('فشل تحديث ترتيب البطاقات'),
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns', 'board', id],
    queryFn: () => campaignsService.list({ boardId: id, limit: 50 }),
    enabled: tab === 'campaigns' && !!id,
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams', 'board', id],
    queryFn: () => teamsService.list({ boardId: id, limit: 50 }),
    enabled: tab === 'teams' && !!id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل البورد" onRetry={refetch} />;

  const board = data?.board;

  const campaignColumns = [
    { key: 'name', title: 'الحملة', render: (row) => (
      <Link to={ROUTES.CAMPAIGN_DETAILS(row.id)} className="font-bold text-[#2563EB] hover:underline">{row.name}</Link>
    )},
    { key: 'status', title: 'الحالة', render: (row) => STATUS_LABELS.campaign[row.status] },
    { key: 'postLinks', title: 'روابط', render: (row) => formatNumber(row._count?.postLinks) },
  ];

  const teamColumns = [
    { key: 'name', title: 'الفريق', render: (row) => (
      <Link to={ROUTES.TEAM_DETAILS(row.id)} className="font-bold text-[#2563EB] hover:underline">{row.name}</Link>
    )},
    { key: 'type', title: 'النوع', render: (row) => STATUS_LABELS.teamType[row.type] },
    { key: 'members', title: 'الأعضاء', render: (row) => formatNumber(row._count?.members) },
  ];

  return (
    <div className="space-y-6">
      <BoardHeader
        board={board}
        actions={
          <div className="flex flex-wrap gap-2">
            {can('campaigns.create') && (
              <Link to={`${ROUTES.CAMPAIGN_CREATE}?boardId=${id}`}>
                <Button size="sm"><Megaphone size={14} /> حملة جديدة</Button>
              </Link>
            )}
            {can('teams.create') && (
              <Link to={`${ROUTES.TEAM_CREATE}?boardId=${id}`}>
                <Button size="sm" variant="secondary"><UsersRound size={14} /> فريق</Button>
              </Link>
            )}
            {can('boards.update') && (
              <Link to={ROUTES.BOARD_EDIT(id)}>
                <Button size="sm" variant="ghost"><Settings size={14} /></Button>
              </Link>
            )}
            {can('reports.view') && (
              <Link to={`${ROUTES.REPORTS_CAMPAIGNS}?boardId=${id}`}>
                <Button size="sm" variant="ghost"><BarChart3 size={14} /></Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap border-b border-gray-100 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition ${tab === t.id ? 'bg-white text-[#2563EB] shadow-sm border border-b-0 border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'board' && (
        <KanbanBoard
          columns={data?.columns || []}
          draggable={can('post_links.update')}
          onColumnsUpdate={(updates) => kanbanMutation.mutate(updates)}
          renderCard={(card) => <PostLinkKanbanCard card={card} draggable={can('post_links.update')} />}
          emptyMessage="لا توجد منشورات في هذا البورد"
        />
      )}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-6">
            <LayoutGrid className="mx-auto text-[#2563EB] mb-2" />
            <p className="text-3xl font-extrabold">{board?.campaignsCount}</p>
            <p className="text-sm text-gray-500">حملات</p>
          </Card>
          <Card className="text-center p-6">
            <UsersRound className="mx-auto text-purple-600 mb-2" />
            <p className="text-3xl font-extrabold">{board?.teamsCount}</p>
            <p className="text-sm text-gray-500">فرق</p>
          </Card>
          <Card className="text-center p-6">
            <p className="text-3xl font-extrabold text-green-600">{board?.progress}%</p>
            <p className="text-sm text-gray-500">نسبة الإنجاز</p>
          </Card>
        </div>
      )}

      {tab === 'campaigns' && (
        <Card>
          <Table columns={campaignColumns} data={campaignsData?.data || []} emptyMessage="لا توجد حملات" />
        </Card>
      )}

      {tab === 'teams' && (
        <Card>
          <Table columns={teamColumns} data={teamsData?.data || []} emptyMessage="لا توجد فرق" />
        </Card>
      )}

      {tab === 'activity' && (
        <Card>
          <ActivityTimeline activities={[]} />
          <p className="text-sm text-gray-400 text-center py-4">عرض النشاطات من صفحات المهام والتعيينات</p>
        </Card>
      )}
    </div>
  );
}
