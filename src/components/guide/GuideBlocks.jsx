import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Info, AlertTriangle, Lightbulb } from 'lucide-react';

const CALLOUT_STYLES = {
  info: { bg: 'bg-blue-50', border: 'border-blue-100', icon: Info, iconColor: 'text-blue-600', titleColor: 'text-blue-900' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertTriangle, iconColor: 'text-amber-600', titleColor: 'text-amber-900' },
  tip: { bg: 'bg-teal-50', border: 'border-teal-100', icon: Lightbulb, iconColor: 'text-teal-600', titleColor: 'text-teal-900' },
};

const COLUMN_COLORS = {
  blue: 'from-blue-600 to-indigo-600',
  teal: 'from-teal-500 to-cyan-600',
  gray: 'from-slate-600 to-slate-700',
};

export function GuideCallout({ variant = 'info', title, text }) {
  const s = CALLOUT_STYLES[variant] || CALLOUT_STYLES.info;
  const Icon = s.icon;
  return (
    <div className={`rounded-2xl border p-5 ${s.bg} ${s.border}`}>
      <div className="flex gap-3">
        <Icon size={20} className={`${s.iconColor} shrink-0 mt-0.5`} />
        <div>
          {title && <p className={`font-extrabold text-sm mb-1 ${s.titleColor}`}>{title}</p>}
          <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function GuideParagraph({ text }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{text}</p>;
}

export function GuideFlow({ title, items }) {
  return (
    <div className="space-y-4">
      {title && <h4 className="text-sm font-extrabold text-gray-800">{title}</h4>}
      <div className="flex flex-wrap items-stretch gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-3 min-w-[100px] text-center">
              <p className="text-sm font-extrabold text-gray-900">{item.label}</p>
              {item.desc && <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>}
            </div>
            {i < items.length - 1 && (
              <ArrowLeft size={16} className="text-gray-300 shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuideHierarchy({ items }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4" style={{ paddingRight: `${(item.level - 1) * 24}px` }}>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center text-sm font-extrabold shrink-0">
              {item.level}
            </div>
            {i < items.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[16px]" />}
          </div>
          <div className="pb-5 flex-1">
            <p className="font-extrabold text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
            {item.example && (
              <span className="inline-block mt-2 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                مثال: {item.example}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuideSteps({ items }) {
  return (
    <ol className="space-y-3">
      {items.map((step, i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:border-blue-100 hover:shadow-sm transition">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2563EB] text-white text-sm font-extrabold shrink-0">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-900">{step.title}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.desc}</p>
            {step.path && (
              <Link to={step.path} className="inline-flex items-center gap-1 text-sm font-bold text-[#2563EB] mt-2 hover:underline">
                انتقل للصفحة <ExternalLink size={13} />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GuideCompare({ columns }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {columns.map((col, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <div className={`bg-gradient-to-l ${COLUMN_COLORS[col.color] || COLUMN_COLORS.blue} px-5 py-4 text-white`}>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-extrabold">{col.title}</h4>
              {col.badge && (
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg">{col.badge}</span>
              )}
            </div>
          </div>
          <div className="p-5 space-y-3">
            <ol className="space-y-2.5">
              {col.steps.map((step, j) => (
                <li key={j} className="flex gap-2.5 text-sm text-gray-700">
                  <span className="text-[#2563EB] font-extrabold shrink-0">{j + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            {col.note && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                {col.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuideTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3.5 text-right font-extrabold text-gray-700 text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-blue-50/30 transition">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-3.5 text-gray-600 leading-relaxed ${ci === 0 ? 'font-bold text-gray-900' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GuideBullets({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function GuideStatusFlows({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-extrabold text-gray-500 uppercase mb-3">{item.label}</p>
          <div className="flex flex-wrap items-center gap-2">
            {item.flow.map((status, j) => (
              <div key={j} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg">{status}</span>
                {j < item.flow.length - 1 && <ArrowLeft size={12} className="text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuideFaq({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details key={i} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <summary className="px-5 py-4 cursor-pointer font-bold text-gray-900 hover:bg-gray-50 list-none flex items-center justify-between gap-3">
            <span>{item.q}</span>
            <span className="text-[#2563EB] text-lg font-light group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div className="px-5 pb-4 pt-0 border-t border-gray-50">
            <p className="text-sm text-gray-600 leading-relaxed pt-3">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function GuideLinks({ links }) {
  if (!links?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1d4ed8] transition shadow-sm"
        >
          {link.label} <ExternalLink size={14} />
        </Link>
      ))}
    </div>
  );
}

export function GuideBlockRenderer({ block }) {
  switch (block.type) {
    case 'callout':
      return <GuideCallout variant={block.variant} title={block.title} text={block.text} />;
    case 'paragraph':
      return <GuideParagraph text={block.text} />;
    case 'flow':
      return <GuideFlow title={block.title} items={block.items} />;
    case 'hierarchy':
      return <GuideHierarchy items={block.items} />;
    case 'steps':
      return <GuideSteps items={block.items} />;
    case 'compare':
      return <GuideCompare columns={block.columns} />;
    case 'table':
      return <GuideTable headers={block.headers} rows={block.rows} />;
    case 'bullets':
      return <GuideBullets items={block.items} />;
    case 'statusFlows':
      return <GuideStatusFlows items={block.items} />;
    case 'faq':
      return <GuideFaq items={block.items} />;
    default:
      return null;
  }
}
