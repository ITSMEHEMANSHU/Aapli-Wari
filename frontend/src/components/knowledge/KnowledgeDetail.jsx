import React from 'react';
import { FaCheckCircle, FaEdit, FaHistory, FaBookOpen, FaChevronRight } from 'react-icons/fa';
import { CATEGORIES } from './data/knowledgeData';

export const KnowledgeDetail = ({ item, onOpenSuggest, onOpenHistory }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ARTICLE READER */}
      <div className="lg:col-span-8 bg-white border border-[#E8D9C3] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {item.categories.map(cId => {
              const cat = CATEGORIES.find(c => c.id === cId);
              return (
                <span key={cId} className="text-xs font-semibold bg-[#FDF8F0] text-[#DD6B35] px-2.5 py-1 rounded-md border border-[#E8D9C3]">
                  {cat?.icon} {cat?.label}
                </span>
              );
            })}
          </div>
          {item.reviewStatus === 'reviewed' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <FaCheckCircle /> Community Reviewed
            </span>
          )}
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#2B1B12] mb-1">{item.title}</h1>
        <div className="text-lg font-serif text-[#DD6B35] mb-4">{item.vernacularTitle}</div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#4A392E]/70 py-2.5 border-y border-[#F5EAD9] mb-6">
          <span>Last reviewed: <strong>{item.updatedDate}</strong></span>
          <span>•</span>
          <span>Contributors: <strong>{item.contributorsCount}</strong></span>
          <span>•</span>
          <span>Sources: <strong>{item.sourcesCount}</strong></span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={onOpenSuggest} className="text-[#DD6B35] font-semibold hover:underline flex items-center gap-1">
              <FaEdit /> Suggest Change
            </button>
            <button onClick={onOpenHistory} className="text-[#4A392E]/70 font-semibold hover:underline flex items-center gap-1 ml-3">
              <FaHistory /> History
            </button>
          </div>
        </div>

        <div className="space-y-6 leading-relaxed text-[#2B1B12]">
          {item.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-24">
              <h2 className="text-lg font-serif font-bold text-[#2B1B12] mb-2 pb-1 border-b border-[#F5EAD9]">
                {sec.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A392E]/90 leading-relaxed">{sec.content}</p>
            </section>
          ))}
        </div>

        {/* SOURCES */}
        <div className="mt-10 pt-6 border-t border-[#E8D9C3]">
          <h3 className="text-base font-serif font-bold text-[#2B1B12] mb-3 flex items-center gap-2">
            <FaBookOpen className="text-[#DD6B35]" /> Sources & References
          </h3>
          <div className="space-y-2">
            {item.sources.map((src, idx) => (
              <div key={idx} className="bg-[#FDF8F0] border border-[#E8D9C3] rounded-xl p-3 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#2B1B12]">{src.title}</div>
                  <div className="text-[#4A392E]/70">{src.author} ({src.year}) — <span className="italic">{src.type}</span></div>
                </div>
                <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RELATED KNOWLEDGE */}
        <div className="mt-8 pt-6 border-t border-[#E8D9C3]">
          <h3 className="text-base font-serif font-bold text-[#2B1B12] mb-3">Explore Related Knowledge</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {['Dehu', 'Tukaram Palkhi', 'Wari Tradition', 'Abhanga Collection', 'Warkari Traditions', 'Pandharpur'].map((rel, i) => (
              <div key={i} className="bg-[#FDF8F0] hover:bg-[#F5EAD9] border border-[#E8D9C3] p-2.5 rounded-xl cursor-pointer text-xs font-semibold text-[#2B1B12] flex items-center justify-between transition">
                <span>{rel}</span>
                <FaChevronRight className="text-[10px] text-[#DD6B35]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="lg:col-span-4 space-y-6">
        {item.quickFacts && (
          <div className="bg-[#FFFDF9] border border-[#E8D9C3] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#DD6B35] mb-3 pb-2 border-b border-[#F5EAD9]">
              Quick Facts
            </h3>
            <dl className="space-y-2 text-xs">
              {Object.entries(item.quickFacts).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2 border-b border-[#FDF8F0] pb-1">
                  <dt className="text-[#4A392E]/60 font-medium">{key}:</dt>
                  <dd className="font-semibold text-[#2B1B12] text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="sticky top-20 bg-[#FFFDF9] border border-[#E8D9C3] rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A392E] mb-2">On This Page</h3>
          <nav className="space-y-1 text-xs">
            {item.sections.map((sec) => (
              <a key={sec.id} href={`#${sec.id}`} className="block py-1 px-2 rounded hover:bg-[#FDF8F0] text-[#4A392E]/80 hover:text-[#DD6B35] transition">
                {sec.title}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};