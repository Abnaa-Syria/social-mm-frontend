import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Zap, CheckCircle, ArrowLeft, ArrowRight, Link2, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PageHelp from '../../components/common/PageHelp';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import {
  campaignsService, platformsService, postLinksService, taskTypesService,
  teamsService, tasksService, assignmentsService,
} from '../../services';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../config/routes';
import { getApiErrorMessage } from '../../lib/formatters';

const toOptionalNum = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const toRequiredNum = (msg) => z.preprocess(
  toOptionalNum,
  z.number({ required_error: msg, invalid_type_error: msg }).positive(msg),
);

/** تحقق منفصل لكل خطوة — بدون التحقق من حقول الخطوات الأخرى */
const step1NewSchema = z.object({
  campaignId: toRequiredNum('الحملة مطلوبة'),
  platformId: toRequiredNum('المنصة مطلوبة'),
  url: z.string().min(1, 'رابط المنشور مطلوب').url('رابط غير صالح'),
});

const step1ExistingSchema = z.object({
  postLinkId: toRequiredNum('اختر رابط منشور موجوداً'),
});

const step2Schema = z.object({
  title: z.string().min(2, 'عنوان المهمة مطلوب').max(200),
  taskTypeId: toRequiredNum('نوع المهمة مطلوب'),
  teamId: z.preprocess(toOptionalNum, z.number().positive().optional()),
  targetCount: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return 1;
      const n = Number(v);
      return Number.isNaN(n) || n < 1 ? 1 : n;
    },
    z.number().min(1, 'العدد المستهدف يجب أن يكون 1 على الأقل'),
  ),
});

const parseZodError = (error) => error.issues[0]?.message || 'تحقق من الحقول المطلوبة';
export default function QuickStartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns-select-active'],
    queryFn: () => campaignsService.list({ limit: 100, status: 'ACTIVE' }),
  });
  const { data: platformsData } = useQuery({
    queryKey: ['platforms-select'],
    queryFn: () => platformsService.list({ limit: 50 }),
  });
  const { data: postLinksData } = useQuery({
    queryKey: ['post-links-select'],
    queryFn: () => postLinksService.list({ limit: 100 }),
  });
  const { data: taskTypesData } = useQuery({
    queryKey: ['task-types-select'],
    queryFn: () => taskTypesService.list({ limit: 50 }),
  });
  const { data: teamsData } = useQuery({
    queryKey: ['teams-select'],
    queryFn: () => teamsService.list({ limit: 50 }),
  });

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors }, setError, clearErrors } = useForm({
    shouldUnregister: false,
    defaultValues: {      mode: 'new',
      campaignId: '',
      postLinkId: '',
      platformId: '',
      url: '',
      taskTypeId: '',
      teamId: '',
      title: '',
      targetCount: 1,
      assignToSelf: false,
    },
  });

  const mode = watch('mode');
  const teamId = watch('teamId');

  const { data: teamMembersData } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamsService.getMembers(Number(teamId)),
    enabled: !!teamId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let postLinkId = data.postLinkId ? Number(data.postLinkId) : null;

      if (data.mode === 'new') {
        const postLink = await postLinksService.create({
          campaignId: Number(data.campaignId),
          platformId: Number(data.platformId),
          url: data.url,
          title: data.title,
          status: 'NEW',
        });
        postLinkId = postLink.id;
      }

      const task = await tasksService.create({
        postLinkId,
        taskTypeId: Number(data.taskTypeId),
        teamId: data.teamId ? Number(data.teamId) : null,
        title: data.title,
        targetCount: Number(data.targetCount) || 1,
        status: 'TODO',
        priority: 'MEDIUM',
      });

      const userIds = [];
      if (data.assignToSelf && user?.id) userIds.push(user.id);
      if (selectedMembers.length) userIds.push(...selectedMembers);

      let uniqueIds = [...new Set(userIds)];
      const effectiveTeamId = data.teamId ? Number(data.teamId) : task.teamId;

      if (uniqueIds.length && effectiveTeamId) {
        const teamMembers = await teamsService.getMembers(effectiveTeamId);
        const memberUserIds = new Set((teamMembers || []).map((m) => m.userId));
        const validIds = uniqueIds.filter((id) => memberUserIds.has(id));
        const skipped = uniqueIds.filter((id) => !memberUserIds.has(id));
        if (skipped.length && validIds.length) {
          toast.error(`تم تخطي ${skipped.length} عضو لأنه ليس ضمن الفريق المختار`);
        } else if (skipped.length && !validIds.length) {
          throw new Error('الأعضاء المختارون ليسوا ضمن الفريق — اختر أعضاء الفريق أو أزل اختيار الفريق');
        }
        uniqueIds = validIds;
      }

      if (uniqueIds.length) {
        if (effectiveTeamId) {
          await tasksService.assignTeamMembers(task.id, { userIds: uniqueIds });
        } else {
          await assignmentsService.create({ taskId: task.id, userIds: uniqueIds });
        }
      }

      return { task, postLinkId };
    },
    onSuccess: ({ task }) => {
      toast.success('تم إنشاء المهمة والتعيين بنجاح');
      navigate(ROUTES.TASK_DETAILS(task.id));
    },
    onError: (err) => toast.error(err?.message || getApiErrorMessage(err)),
  });

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loadingCampaigns) return <LoadingState />;

  const campaigns = campaignsData?.data || [];
  const platforms = platformsData?.data || [];
  const postLinks = postLinksData?.data || [];
  const taskTypes = taskTypesData?.data || [];
  const teams = teamsData?.data || [];
  const members = teamMembersData || [];

  const onSubmit = (raw) => {
    const mode = raw.mode || 'new';
    const step1 = mode === 'new'
      ? step1NewSchema.safeParse(raw)
      : step1ExistingSchema.safeParse(raw);
    if (!step1.success) {
      toast.error(parseZodError(step1.error));
      setStep(1);
      return;
    }
    const step2 = step2Schema.safeParse(raw);
    if (!step2.success) {
      toast.error(parseZodError(step2.error));
      setStep(2);
      return;
    }
    createMutation.mutate({ ...raw, ...step1.data, ...step2.data, memberIds: selectedMembers });
  };

  const goToStep2 = () => {
    clearErrors();
    const values = getValues();
    const result = values.mode === 'existing'
      ? step1ExistingSchema.safeParse(values)
      : step1NewSchema.safeParse(values);
    if (!result.success) {
      const field = result.error.issues[0]?.path[0];
      const msg = parseZodError(result.error);
      if (field) setError(field, { message: msg });
      toast.error(msg);
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    clearErrors();
    const result = step2Schema.safeParse(getValues());
    if (!result.success) {
      const field = result.error.issues[0]?.path[0];
      const msg = parseZodError(result.error);
      if (field) setError(field, { message: msg });
      toast.error(msg);
      return;
    }
    setStep(3);
  };
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="إنشاء سريع"
        subtitle="رابط منشور + مهمة + تعيين — في خطوة واحدة"
      />
      <PageHelp pageKey="quickStart" />

      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition ${step >= s ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 font-bold">الخطوة {step} من 3</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card className="space-y-5">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Link2 size={18} className="text-[#2563EB]" /> رابط المنشور
            </h3>

            <input type="hidden" {...register('mode')} />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue('mode', 'new')}
                className={`flex-1 p-4 rounded-xl border-2 text-sm font-bold transition ${mode === 'new' ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
              >
                رابط جديد
              </button>
              <button
                type="button"
                onClick={() => setValue('mode', 'existing')}
                className={`flex-1 p-4 rounded-xl border-2 text-sm font-bold transition ${mode === 'existing' ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
              >
                رابط موجود
              </button>
            </div>

            {mode === 'new' ? (
              <>
                <Select label="الحملة *" error={errors.campaignId?.message} {...register('campaignId')}>
                  <option value="">— اختر حملة نشطة —</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.board?.name ? `(${c.board.name})` : ''}</option>
                  ))}
                </Select>
                <Select label="المنصة *" error={errors.platformId?.message} {...register('platformId')}>
                  <option value="">— اختر المنصة —</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
                <Input label="رابط المنشور *" dir="ltr" placeholder="https://..." error={errors.url?.message} {...register('url')} />
              </>
            ) : (
              <Select label="رابط المنشور الموجود *" error={errors.postLinkId?.message} {...register('postLinkId')}>
                <option value="">— اختر رابطاً —</option>
                {postLinks.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.title || pl.url?.slice(0, 50)} — {pl.campaign?.name}</option>
                ))}
              </Select>
            )}

            <div className="flex justify-end">
              <Button type="button" onClick={goToStep2}>
                التالي <ArrowLeft size={16} />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-5">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Zap size={18} className="text-[#2563EB]" /> تفاصيل المهمة
            </h3>

            <Input label="عنوان المهمة *" placeholder="مثال: 20 لايك للمنشور" error={errors.title?.message} {...register('title')} />
            <Select label="نوع المهمة *" error={errors.taskTypeId?.message} {...register('taskTypeId')}>
              <option value="">— اختر النوع —</option>
              {taskTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Select label="الفريق (اختياري)" {...register('teamId')}>
              <option value="">— بدون فريق —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Input label="العدد المستهدف" type="number" min={1} error={errors.targetCount?.message} {...register('targetCount')} />

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                <ArrowRight size={16} /> السابق
              </Button>
              <Button type="button" onClick={goToStep3}>
                التالي <ArrowLeft size={16} />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-5">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-[#2563EB]" /> تعيين الأعضاء
            </h3>
            <p className="text-sm text-gray-500">اختر من سينفّذ المهمة. يمكنك تخطي هذه الخطوة والتعيين لاحقاً.</p>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" {...register('assignToSelf')} className="rounded" />
              <span className="text-sm font-bold">عيّن لي ({user?.name})</span>
            </label>

            {teamId && members.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700">أعضاء الفريق:</p>
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.userId)}
                      onChange={() => toggleMember(m.userId)}
                      className="rounded"
                    />
                    <span className="text-sm">{m.user?.name || m.userId}</span>
                  </label>
                ))}
              </div>
            )}

            {!teamId && (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
                اختر فريقاً في الخطوة السابقة لعرض أعضائه، أو عيّن لنفسك فقط.
              </p>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                <ArrowRight size={16} /> السابق
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                <CheckCircle size={16} /> إنشاء الكل
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
