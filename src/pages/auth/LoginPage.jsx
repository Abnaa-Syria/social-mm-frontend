import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, BarChart3, Users, CheckCircle, Zap } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../lib/formatters';
import { ROUTES } from '../../config/routes';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

const FEATURES = [
  { icon: BarChart3, text: 'تقارير ولوحات تحليلية شاملة' },
  { icon: Users, text: 'إدارة الفرق والتعيينات بكل سهولة' },
  { icon: CheckCircle, text: 'مراجعة وإثبات التنفيذ في مكان واحد' },
  { icon: Zap, text: 'إنشاء مهام بسرعة بخطوات مبسّطة' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('مرحباً بك!');
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* ===== الجانب الأيسر — صورة وشعار (يظهر على الشاشات الكبيرة فقط) ===== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-[#0F172A] flex-col">
        {/* خلفية متدرجة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1e1e6e] to-[#0F172A]" />

        {/* نقاط زخرفية */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* دوائر ضوئية */}
        <div className="absolute top-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#14B8A6]/10 blur-2xl" />

        {/* المحتوى */}
        <div className="relative flex flex-col h-full p-12 xl:p-16">
          {/* الشعار */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="text-white font-extrabold text-lg">س</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none">مساحة عمليات</p>
              <p className="text-slate-400 text-[11px] mt-0.5">السوشيال ميديا</p>
            </div>
          </div>

          {/* العنوان الرئيسي */}
          <div className="flex-1 flex flex-col justify-center max-w-[400px]">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
              <span className="text-xs text-slate-300 font-bold">منصة إدارة متكاملة</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              أدِر فريقك
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#60A5FA] to-[#A78BFA]">
                باحترافية كاملة
              </span>
            </h1>
            <p className="text-slate-400 mt-5 leading-relaxed text-sm xl:text-base">
              منصة داخلية لتتبع عمليات السوشيال ميديا — من تعيين المهام حتى الإثبات والمراجعة والتقارير.
            </p>

            {/* الميزات */}
            <ul className="mt-10 space-y-4">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-[#60A5FA]" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* فوتر الجانب */}
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} مساحة عمليات السوشيال ميديا. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>

      {/* ===== الجانب الأيمن — نموذج الدخول ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F6F7FB]">
        <div className="w-full max-w-[420px]">

          {/* شعار صغير للجوال فقط */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-lg">س</span>
            </div>
            <div>
              <p className="text-gray-900 font-extrabold text-sm">مساحة عمليات</p>
              <p className="text-gray-500 text-[11px]">السوشيال ميديا</p>
            </div>
          </div>

          {/* رأس النموذج */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">أهلاً بك!</h2>
            <p className="text-gray-500 text-sm mt-2">أدخل بياناتك للوصول إلى لوحة التحكم.</p>
          </div>

          {/* البطاقة */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              {/* البريد الإلكتروني */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  dir="ltr"
                  className={`w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400
                    focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50
                    ${errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* كلمة المرور */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    className={`w-full rounded-2xl border bg-gray-50 px-4 py-3 pe-12 text-sm outline-none transition placeholder:text-gray-400
                      focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50
                      ${errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* زر الدخول */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-[#1E3A8A] to-[#2563EB] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    دخول إلى المنصة
                  </>
                )}
              </button>
            </form>
          </div>

          {/* تذييل */}
          <p className="text-center text-xs text-gray-400 mt-6">
            منصة مخصصة للفريق الداخلي فقط — لا تدعم التسجيل العام
          </p>
        </div>
      </div>
    </div>
  );
}
