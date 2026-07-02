import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link2, ClipboardList, Pencil, BarChart3, MessageSquare } from 'lucide-react';
import { workspaceService, postLinksService } from '../../services';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import KanbanBoard from '../../components/workspace/KanbanBoard';
import PostLinkKanbanCard from '../../components/workspace/PostLinkKanbanCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate } from '../../lib/formatters';

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign-kanban', id],
    queryFn: () => workspaceService.getCampaignKanban(id),
  });

  const kanbanMutation = useMutation({
    mutationFn: (updates) => Promise.all(
      updates.map((update) => postLinksService.reorder({
        status: update.columnId,
        orderedIds: update.orderedIds,
      })),
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-kanban', id] });
    },
    onError: () => toast.error('فشل تحديث ترتيب البطاقات'),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الحملة" onRetry={refetch} />;

  const campaign = data?.campaign;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-[#7C3AED] to-[#2563EB]" />
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">{campaign?.name}</h1>
              <StatusBadge status={campaign?.status} label={STATUS_LABELS.campaign[campaign?.status]} />
              {campaign?.priority && (
                <PriorityBadge priority={campaign.priority} label={STATUS_LABELS.priority[campaign.priority]} />
              )}
            </div>
            {campaign?.board && (
              <Link to={ROUTES.BOARD_DETAILS(campaign.board.id)} className="text-sm text-[#2563EB] hover:underline mt-1 inline-block">
                {campaign.board.name}
              </Link>
            )}
            {campaign?.description && <p className="text-sm text-gray-500 mt-2">{campaign.description}</p>}
            <p className="text-xs text-gray-400 mt-2">
              {campaign?.startDate ? formatDate(campaign.startDate) : '—'} — {campaign?.endDate ? formatDate(campaign.endDate) : '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can('post_links.create') && (
              <Link to={`${ROUTES.POST_LINK_CREATE}?campaignId=${id}`}>
                <Button size="sm"><Link2 size={14} /> أضف رابط منشور</Button>
              </Link>
            )}
            {can('tasks.create') && (
              <Link to={`${ROUTES.TASK_CREATE}?campaignId=${id}`}>
                <Button size="sm" variant="secondary"><ClipboardList size={14} /> أنشئ مهمة</Button>
              </Link>
            )}
            {can('comment_suggestions.create') && (
              <Link to={`${ROUTES.COMMENT_SUGGESTION_CREATE}?campaignId=${id}`}>
                <Button size="sm" variant="ghost"><MessageSquare size={14} /> تعليقات مقترحة</Button>
              </Link>
            )}
            {can('campaigns.update') && (
              <Link to={ROUTES.CAMPAIGN_EDIT(id)}>
                <Button size="sm" variant="ghost"><Pencil size={14} /></Button>
              </Link>
            )}
            {can('reports.view') && (
              <Link to={`${ROUTES.REPORTS_CAMPAIGNS}?campaignId=${id}`}>
                <Button size="sm" variant="ghost"><BarChart3 size={14} /></Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <KanbanBoard
            columns={data?.columns || []}
            draggable={can('post_links.update')}
            onColumnsUpdate={(updates) => kanbanMutation.mutate(updates)}
            renderCard={(card) => <PostLinkKanbanCard card={card} draggable={can('post_links.update')} />}
            emptyMessage="ابدأ بإضافة رابط منشور لهذه الحملة"
          />
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-extrabold text-gray-900 mb-4">ملخص الحملة</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">المنشورات</span>
                <span className="font-bold">{(data?.columns || []).reduce((s, c) => s + (c.cards?.length || 0), 0)}</span>
              </div>
              <div>
                <p className="text-gray-500 mb-2">التقدم</p>
                <ProgressBar value={50} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
