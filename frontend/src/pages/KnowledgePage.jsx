import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { api } from '../services/api';
import { KnowledgeHero } from '../components/knowledge/KnowledgeHero';
import { CategoryFilters } from '../components/knowledge/CategoryFilters';
import { ContentTypeFilter } from '../components/knowledge/ContentTypeFilter';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { KnowledgeDetail } from '../components/knowledge/KnowledgeDetail';
import { ContributeHub } from '../components/knowledge/ContributeHub';
import { MyContributions } from '../components/knowledge/MyContributions';
import { CommunityReview } from '../components/knowledge/CommunityReview';
import { RevisionHistoryModal } from '../components/knowledge/RevisionHistoryModal';
import { SuggestChangeModal } from '../components/knowledge/SuggestChangeModal';

const normalizeKnowledgeItem = (item) => ({
  ...item,
  contentType: item.content_type,
  vernacularTitle: item.vernacular_title,
  fileUrl: item.file_url,
  reviewStatus: item.verified ? 'reviewed' : item.status,
  updatedDate: item.updated_at
    ? new Date(item.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown',
  sourcesCount: Array.isArray(item.sources) ? item.sources.length : 0,
  contributorsCount: item.contributors_count || 0,
  categories: Array.isArray(item.categories) ? item.categories : [],
  quickFacts: item.quick_facts || {},
  sections: Array.isArray(item.sections) ? item.sections : [],
  sources: Array.isArray(item.sources) ? item.sources : [],
});

export const KnowledgePage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'contribute' ? 'contribute' : 'browse'
  );

  // Real Data States
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Modals 
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Fetch real content from backend API when filters change
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (searchQuery) {
          params.search = searchQuery; // ✅ Maps to FastAPI backend query parameter 'search'
        }
        if (selectedContentType && selectedContentType !== 'all') {
          // ✅ Safely map legacy 'article' to 'text' to prevent backend errors
          params.content_type = selectedContentType === 'article' ? 'text' : selectedContentType;
        }
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories.join(',');
        }

        const data = await api.contentList(params);
        const contentList = (Array.isArray(data) ? data : data.items || []).map(normalizeKnowledgeItem);

        setItems(contentList);

        // Default select the first item if none is selected yet
        if (contentList.length > 0 && !selectedItem) {
          setSelectedItem(contentList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch knowledge list:", err);
        setError("Could not load knowledge items from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [searchQuery, selectedContentType, selectedCategories]);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#2B1B12] font-sans antialiased">

      {/* HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E8D9C3] px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 min-w-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeTab === 'browse' || activeTab === 'detail' ? 'bg-[#DD6B35]/10 text-[#DD6B35]' : 'text-[#4A392E]/70 hover:bg-[#F5EAD9]'}`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('my_contributions')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeTab === 'my_contributions' ? 'bg-[#DD6B35]/10 text-[#DD6B35]' : 'text-[#4A392E]/70 hover:bg-[#F5EAD9]'}`}
          >
            My Contributions
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeTab === 'review' ? 'bg-[#DD6B35]/10 text-[#DD6B35]' : 'text-[#4A392E]/70 hover:bg-[#F5EAD9]'}`}
          >
            Community Review <span className="ml-1 px-1.5 bg-[#DD6B35] text-white rounded-full text-[9px]">18</span>
          </button>
        </nav>
        <button
          onClick={() => setActiveTab('contribute')}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          Contribute
        </button>
      </header>

      {/* BODY */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <KnowledgeHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <CategoryFilters
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              clearCategories={() => setSelectedCategories([])}
            />

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-[#DD6B35] text-3xl" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-[#4A392E]/70">
                No knowledge items found matching your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {items.map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    onClick={() => { setSelectedItem(item); setActiveTab('detail'); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'detail' && selectedItem && (
          <KnowledgeDetail
            item={selectedItem}
            onOpenSuggest={() => setShowSuggestModal(true)}
            onOpenHistory={() => setShowHistoryModal(true)}
          />
        )}

        {activeTab === 'contribute' && (
          <ContributeHub onComplete={() => setActiveTab('my_contributions')} />
        )}

        {activeTab === 'my_contributions' && <MyContributions />}
        {activeTab === 'review' && <CommunityReview />}
      </main>

      {/* MODALS */}
      <SuggestChangeModal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} />
      <RevisionHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  );
};

export default KnowledgePage;