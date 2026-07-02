import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'حدث خطأ', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="text-red-500 mb-3" size={32} />
      <p className="font-bold text-gray-700 mb-4">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>إعادة المحاولة</Button>}
    </div>
  );
}
