import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '../../services';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import WorkspaceStatsCard from '../../components/workspace/WorkspaceStatsCard';
import KanbanBoard from '../../components/workspace/KanbanBoard';
import AssignmentKanbanCard from '../../components/workspace/AssignmentKanbanCard';
import DetailsDrawer from '../../components/workspace/DetailsDrawer';
import { ClipboardList, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import Button from '../../components/common/Button';

export default function MyWorkPage() {
  const [selected, setSelected] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['my-work'],
    queryFn: workspaceService.getMyWork,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل مهامك" onRetry={refetch} />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-[#14B8A6] to-[#2563EB] rounded-3xl p-8 text-white shadow-lg">
        <p className="text-teal-100 text-sm">مساحة عملي</p>
        <h1 className="text-3xl font-extrabold mt-1">مهامي وتعييناتي</h1>
        <p className="text-white/80 mt-2">تابع مهامك، نفّذها، وأرسلها للمراجعة من مكان واحد.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <WorkspaceStatsCard title="الإجمالي" value={stats.total} icon={ClipboardList} color="blue" />
        <WorkspaceStatsCard title="معلقة" value={stats.pending} icon={Clock} color="amber" />
        <WorkspaceStatsCard title="مُرسلة" value={stats.submitted} icon={Send} color="purple" />
        <WorkspaceStatsCard title="مكتملة" value={stats.completed} icon={CheckCircle} color="green" />
        <WorkspaceStatsCard title="مرفوضة" value={stats.rejected} icon={XCircle} color="red" />
      </div>

      <KanbanBoard
        columns={data?.columns || []}
        renderCard={(card) => (
          <AssignmentKanbanCard card={card} onOpen={setSelected} />
        )}
        emptyMessage="لا توجد مهام حالياً"
      />

      <DetailsDrawer open={!!selected} onClose={() => setSelected(null)} title="تفاصيل التعيين">
        {selected && (
          <div className="space-y-4">
            <AssignmentKanbanCard card={selected} />
            <div className="flex gap-2">
              <Link to={ROUTES.ASSIGNMENT_DETAILS(selected.id)} className="flex-1">
                <Button className="w-full">فتح صفحة التنفيذ</Button>
              </Link>
              {selected.task?.postLink?.url && (
                <a href={selected.task.postLink.url} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="secondary" className="w-full">افتح المنشور الأصلي</Button>
                </a>
              )}
            </div>
          </div>
        )}
      </DetailsDrawer>
    </div>
  );
}
