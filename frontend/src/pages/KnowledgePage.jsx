import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import { MOCK_KNOWLEDGE_LIST } from '../components/knowledge/data/knowledgeData';
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

export const KnowledgePage = () => {
  const [activeTab, setActiveTab] = useState('browse'); 
  const [selectedItem, setSelectedItem] = useState(MOCK_KNOWLEDGE_LIST[0]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Modals
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#2B1B12] font-sans antialiased">
      
      {/* HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E8D9C3] px-4 py-2.5 sm:px-6 flex items-center justify-between">
    

        <nav className="flex items-center gap-1.5">
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
          <button 
            onClick={() => setActiveTab('contribute')}
            className="ml-1 px-3 py-1 bg-[#DD6B35] hover:bg-[#C85A28] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <FaPlus className="text-[9px]" /> Contribute
          </button>
        </nav>
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
            <ContentTypeFilter 
              selectedContentType={selectedContentType}
              setSelectedContentType={setSelectedContentType}
              reviewFilter={reviewFilter}
              setReviewFilter={setReviewFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {MOCK_KNOWLEDGE_LIST.map((item) => (
                <KnowledgeCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => { setSelectedItem(item); setActiveTab('detail'); }} 
                />
              ))}
            </div>
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