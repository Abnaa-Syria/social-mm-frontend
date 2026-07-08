import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { PAGE_HELP } from '../../config/pageHelp';

export default function PageHelp({ pageKey, help: helpProp, linkToGuide = true }) {
  const [open, setOpen] = useState(false);
  const help = helpProp || (pageKey ? PAGE_HELP[pageKey] : null);

  if (!help) return null;

  return (
    <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50/80 to-indigo-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-right hover:bg-blue-50/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
            <HelpCircle size={18} className="text-[#2563EB]" />
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-gray-900">{help.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">اضغط لعرض الخطوات والشرح</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-blue-100/60">
          <ol className="space-y-2.5 mt-4">
            {help.steps?.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#2563EB] text-white text-xs font-extrabold shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {linkToGuide && (
            <Link
              to={ROUTES.USAGE_GUIDE}
              className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#2563EB] hover:underline"
            >
              <ListOrdered size={16} />
              دليل الاستخدام الكامل
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
