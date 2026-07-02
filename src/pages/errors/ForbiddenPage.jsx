import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES } from '../../config/routes';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShieldX className="text-red-500" size={32} />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">غير مصرح لك بالوصول لهذه الصفحة</h1>
        <p className="text-sm text-gray-500 mt-2">لا تمتلك الصلاحية المطلوبة لتنفيذ هذا الإجراء</p>
        <Link to={ROUTES.HOME} className="inline-block mt-6">
          <Button>العودة للرئيسية</Button>
        </Link>
      </Card>
    </div>
  );
}
