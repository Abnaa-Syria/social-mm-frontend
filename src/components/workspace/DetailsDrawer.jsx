import { X } from 'lucide-react';

export default function DetailsDrawer({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div className={`relative mr-auto h-full w-full ${width} bg-white shadow-2xl flex flex-col animate-in slide-in-from-right`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
