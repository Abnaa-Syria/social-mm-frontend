import { Upload } from 'lucide-react';

export default function FileUploader({ onChange, accept = 'image/*,.pdf', label = 'رفع ملف' }) {
  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#2563EB] hover:bg-blue-50/30 transition">
      <Upload className="text-gray-400 mb-2" size={24} />
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <input type="file" className="hidden" accept={accept} onChange={(e) => onChange(e.target.files?.[0])} />
    </label>
  );
}
