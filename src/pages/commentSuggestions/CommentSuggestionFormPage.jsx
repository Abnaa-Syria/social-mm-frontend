import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { commentSuggestionsService, boardsService, campaignsService, postLinksService, tasksService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/formatters';

const scopeFields = {
  boardId: z.coerce.number().positive().optional().or(z.literal('')),
  campaignId: z.coerce.number().positive().optional().or(z.literal('')),
  postLinkId: z.coerce.number().positive().optional().or(z.literal('')),
  taskId: z.coerce.number().positive().optional().or(z.literal('')),
};

const singleSchema = z.object({
  ...scopeFields,
  text: z.string().min(2, 'النص مطلوب').max(2000),
  language: z.string().max(10).optional(),
  tone: z.string().optional(),
  usageLimit: z.coerce.number().min(1).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.boardId || data.campaignId || data.postLinkId || data.taskId,
  { message: 'يجب تحديد نطاق واحد على الأقل', path: ['boardId'] }
);

const bulkSchema = z.object({
  ...scopeFields,
  language: z.string().max(10).optional(),
  tone: z.string().optional(),
  usageLimit: z.coerce.number().min(1).optional().or(z.literal('')),
  bulkText: z.string().min(2, 'أدخل سطراً واحداً على الأقل'),
}).refine(
  (data) => data.boardId || data.campaignId || data.postLinkId || data.taskId,
  { message: 'يجب تحديد نطاق واحد على الأقل', path: ['boardId'] }
);

const buildScopePayload = (data) => ({
  boardId: data.boardId ? Number(data.boardId) : null,
  campaignId: data.campaignId ? Number(data.campaignId) : null,
  postLinkId: data.postLinkId ? Number(data.postLinkId) : null,
  taskId: data.taskId ? Number(data.taskId) : null,
});

export default function CommentSuggestionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bulkMode, setBulkMode] = useState(false);

  const { data: suggestion, isLoading: loadingSuggestion, error: loadError } = useQuery({
    queryKey: ['comment-suggestion', id],
    queryFn: () => commentSuggestionsService.get(id),
    enabled: isEdit,
  });

  const { data: boardsData } = useQuery({ queryKey: ['boards-select'], queryFn: () => boardsService.list({ limit: 100 }) });
  const { data: campaignsData } = useQuery({ queryKey: ['campaigns-select'], queryFn: () => campaignsService.list({ limit: 100 }) });
  const { data: postLinksData } = useQuery({ queryKey: ['post-links-select'], queryFn: () => postLinksService.list({ limit: 100 }) });
  const { data: tasksData } = useQuery({ queryKey: ['tasks-select'], queryFn: () => tasksService.list({ limit: 100 }) });

  const singleForm = useForm({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      boardId: '', campaignId: '', postLinkId: '', taskId: '',
      text: '', language: 'ar', tone: 'NEUTRAL', usageLimit: '', isActive: true,
    },
  });

  const bulkForm = useForm({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      boardId: '', campaignId: '', postLinkId: '', taskId: '',
      language: 'ar', tone: 'NEUTRAL', usageLimit: '', bulkText: '',
    },
  });

  useEffect(() => {
    if (suggestion) {
      singleForm.reset({
        boardId: suggestion.boardId || '',
        campaignId: suggestion.campaignId || '',
        postLinkId: suggestion.postLinkId || '',
        taskId: suggestion.taskId || '',
        text: suggestion.text,
        language: suggestion.language || 'ar',
        tone: suggestion.tone || 'NEUTRAL',
        usageLimit: suggestion.usageLimit || '',
        isActive: suggestion.isActive,
      });
    }
  }, [suggestion, singleForm]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return commentSuggestionsService.update(id, {
          text: data.text,
          language: data.language,
          tone: data.tone,
          usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        });
      }
      if (bulkMode) {
        const scope = buildScopePayload(data);
        const lines = data.bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
        const suggestions = lines.map((text) => ({
          ...scope,
          text,
          language: data.language || 'ar',
          tone: data.tone || 'NEUTRAL',
          usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        }));
        return commentSuggestionsService.bulkCreate({ suggestions });
      }
      const scope = buildScopePayload(data);
      return commentSuggestionsService.create({
        ...scope,
        text: data.text,
        language: data.language || 'ar',
        tone: data.tone || 'NEUTRAL',
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        isActive: data.isActive ?? true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-suggestions'] });
      toast.success(isEdit ? 'تم التحديث' : bulkMode ? 'تم إنشاء الاقتراحات' : 'تم الإنشاء');
      navigate(ROUTES.COMMENT_SUGGESTIONS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && loadingSuggestion) return <LoadingState />;
  if (isEdit && loadError) return <ErrorState message="فشل تحميل الاقتراح" />;

  const ScopeFields = ({ register, errors }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select label="البورد" error={errors?.boardId?.message} {...register('boardId')} disabled={isEdit}>
        <option value="">—</option>
        {(boardsData?.data || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
      <Select label="الحملة" error={errors?.campaignId?.message} {...register('campaignId')} disabled={isEdit}>
        <option value="">—</option>
        {(campaignsData?.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Select label="رابط المنشور" error={errors?.postLinkId?.message} {...register('postLinkId')} disabled={isEdit}>
        <option value="">—</option>
        {(postLinksData?.data || []).map((pl) => <option key={pl.id} value={pl.id}>{pl.title || pl.url}</option>)}
      </Select>
      <Select label="المهمة" error={errors?.taskId?.message} {...register('taskId')} disabled={isEdit}>
        <option value="">—</option>
        {(tasksData?.data || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل اقتراح تعليق' : 'إضافة اقتراح تعليق'}
        subtitle={isEdit ? truncatePreview(suggestion?.text) : 'إنشاء اقتراحات تعليقات جاهزة'}
        action={
          !isEdit && (
            <Button variant={bulkMode ? 'primary' : 'secondary'} onClick={() => setBulkMode(!bulkMode)}>
              {bulkMode ? 'وضع فردي' : 'وضع جماعي'}
            </Button>
          )
        }
      />

      <Card>
        {isEdit || !bulkMode ? (
          <form onSubmit={singleForm.handleSubmit((data) => mutation.mutate(data))} className="space-y-5 max-w-2xl">
            {!isEdit && (
              <>
                <p className="text-sm text-gray-500 font-bold">النطاق (حدد واحداً على الأقل)</p>
                <ScopeFields register={singleForm.register} errors={singleForm.formState.errors} />
              </>
            )}
            <Textarea label="نص التعليق *" error={singleForm.formState.errors.text?.message} {...singleForm.register('text')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="اللغة" error={singleForm.formState.errors.language?.message} {...singleForm.register('language')} />
              <Select label="النبرة" {...singleForm.register('tone')}>
                {Object.entries(STATUS_LABELS.commentTone).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <Input label="حد الاستخدام" type="number" min={1} error={singleForm.formState.errors.usageLimit?.message} {...singleForm.register('usageLimit')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ' : 'إنشاء'}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={bulkForm.handleSubmit((data) => mutation.mutate(data))} className="space-y-5 max-w-2xl">
            <p className="text-sm text-gray-500 font-bold">النطاق (حدد واحداً على الأقل)</p>
            <ScopeFields register={bulkForm.register} errors={bulkForm.formState.errors} />
            <Textarea
              label="نصوص التعليقات (سطر لكل اقتراح) *"
              placeholder="تعليق رائع!&#10;محتوى مميز&#10;..."
              rows={10}
              error={bulkForm.formState.errors.bulkText?.message}
              {...bulkForm.register('bulkText')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="اللغة" {...bulkForm.register('language')} />
              <Select label="النبرة" {...bulkForm.register('tone')}>
                {Object.entries(STATUS_LABELS.commentTone).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <Input label="حد الاستخدام" type="number" min={1} {...bulkForm.register('usageLimit')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending}>إنشاء جماعي</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>إلغاء</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

function truncatePreview(text) {
  if (!text) return '';
  return text.length > 50 ? `${text.slice(0, 50)}...` : text;
}
