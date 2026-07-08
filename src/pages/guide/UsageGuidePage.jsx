import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, Users, Layers, Settings, Play, CheckCircle,
  MessageSquare, BarChart3, Bell, HelpCircle, Plus, Search,
} from 'lucide-react';
import { GUIDE_SECTIONS, GUIDE_CATEGORIES } from '../../config/guideContent';
import { GuideBlockRenderer, GuideLinks } from '../../components/guide/GuideBlocks';
import { ROUTES } from '../../config/routes';

const ICONS = {
  info: BookOpen,
  zap: Zap,
  users: Users,
  layers: Layers,
  settings: Settings,
  plus: Plus,
  play: Play,
  check: CheckCircle,
  message: MessageSquare,
  chart: BarChart3,
  bell: Bell,
  list: Layers,
  help: HelpCircle,
};

export default function UsageGuidePage() {
  const [activeId, setActiveId] = useState(GUIDE_SECTIONS[0].id);
  const [search, setSearch] = useState('');

  const active = GUIDE_SECTIONS.find((s) => s.id === activeId) || GUIDE_SECTIONS[0];
  const Icon = ICONS[active.icon] || BookOpen;

  const filteredSections = search.trim()
    ? GUIDE_SECTIONS.filter(
        (s) =>
          s.title.includes(search) ||
          s.summary?.includes(search) ||
          s.blocks?.some((b) => JSON.stringify(b).includes(search))
      )
    : GUIDE_SECTIONS;

  const scrollToSection = (id) => {
    setActiveId(id);
    setSearch('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F172A] via-[#1E3A8A] to-[#7C3AED] p-8 md:p-10 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <BookOpen size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold">دليل الاستخدام</h1>
            <p className="text-blue-100 mt-2 text-sm md:text-base leading-relaxed max-w-xl">
              كل ما تحتاج معرفته لاستخدام المنصة — من الإعداد حتى التنفيذ والمراجعة. اختر موضوعاً من الفهرس.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to={ROUTES.QUICK_START}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-[#0F172A] text-sm font-extrabold hover:bg-amber-300 transition"
            >
              <Zap size={16} /> إنشاء سريع
            </Link>
            <Link
              to={ROUTES.MY_WORK}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 text-white text-sm font-bold hover:bg-white/25 transition border border-white/20"
            >
              <Play size={16} /> مساحة عملي
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="relative mb-3">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في الدليل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 pr-9 pl-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
              />
            </div>

            {search.trim() ? (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {filteredSections.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد نتائج</p>
                ) : (
                  filteredSections.map((section) => {
                    const SIcon = ICONS[section.icon] || BookOpen;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition ${
                          section.id === activeId ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <SIcon size={15} className="shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {GUIDE_CATEGORIES.map((cat) => {
                  const catSections = GUIDE_SECTIONS.filter((s) => s.category === cat.id);
                  if (!catSections.length) return null;
                  return (
                    <div key={cat.id}>
                      <p className="px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        {cat.label}
                      </p>
                      <div className="space-y-0.5">
                        {catSections.map((section) => {
                          const SIcon = ICONS[section.icon] || BookOpen;
                          const isActive = section.id === activeId;
                          return (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() => setActiveId(section.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition ${
                                isActive
                                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-200'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <SIcon size={15} className={`shrink-0 ${isActive ? 'text-blue-200' : ''}`} />
                              <span className="flex-1 leading-snug">{section.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-8 xl:col-span-9">
          <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section header */}
            <header className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-gray-100 bg-gradient-to-l from-gray-50/80 to-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">{active.title}</h2>
                  {active.summary && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{active.summary}</p>
                  )}
                </div>
              </div>
            </header>

            {/* Blocks */}
            <div className="px-6 md:px-8 py-6 md:py-8 space-y-6">
              {active.blocks?.map((block, i) => (
                <GuideBlockRenderer key={i} block={block} />
              ))}

              {active.links?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-extrabold text-gray-400 uppercase mb-3">انتقل مباشرة</p>
                  <GuideLinks links={active.links} />
                </div>
              )}
            </div>
          </article>

          {/* Prev / Next navigation */}
          <div className="flex justify-between gap-3 mt-4">
            {(() => {
              const idx = GUIDE_SECTIONS.findIndex((s) => s.id === activeId);
              const prev = GUIDE_SECTIONS[idx - 1];
              const next = GUIDE_SECTIONS[idx + 1];
              return (
                <>
                  {prev ? (
                    <button
                      type="button"
                      onClick={() => setActiveId(prev.id)}
                      className="flex-1 text-right px-4 py-3 rounded-xl border border-gray-100 bg-white text-sm font-bold text-gray-600 hover:border-blue-200 hover:text-[#2563EB] transition"
                    >
                      ← {prev.title}
                    </button>
                  ) : <div className="flex-1" />}
                  {next ? (
                    <button
                      type="button"
                      onClick={() => setActiveId(next.id)}
                      className="flex-1 text-left px-4 py-3 rounded-xl border border-gray-100 bg-white text-sm font-bold text-gray-600 hover:border-blue-200 hover:text-[#2563EB] transition"
                    >
                      {next.title} →
                    </button>
                  ) : <div className="flex-1" />}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
