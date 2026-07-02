import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { APP_NAME } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/formatters';
import { ROUTES } from '../../config/routes';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#7C3AED]">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#7C3AED] flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">تسجيل الدخول</h1>
            <p className="text-sm text-gray-500 mt-2">{APP_NAME}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="البريد الإلكتروني" type="email" placeholder="admin@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="كلمة المرور" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" /> تذكرني
            </label>
            <Button type="submit" className="w-full" size="lg" loading={loading}>دخول</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
