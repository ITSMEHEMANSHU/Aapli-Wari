export const CATEGORIES = [
  { id: 'saints', label: 'Saints & Sant Parampara', icon: '🪔', desc: 'Dnyaneshwar, Tukaram, Namdev, Eknath...' },
  { id: 'wari_dindi', label: 'Wari & Dindi', icon: '🚶', desc: 'Wari tradition, Dindi system, Palkhi...' },
  { id: 'temples', label: 'Temples & Places', icon: '🛕', desc: 'Alandi, Dehu, Pandharpur...' },
  { id: 'history', label: 'History', icon: '📜', desc: 'Origins, historical developments...' },
  { id: 'abhanga', label: 'Abhanga & Literature', icon: '🎵', desc: 'Abhangas, poetry, manuscripts...' },
  { id: 'traditions', label: 'Traditions & Rituals', icon: '🥁', desc: 'Ringan, Dhwaj, ceremonies...' },
  { id: 'stories', label: 'Warkari Stories', icon: '👥', desc: 'Personal & family traditions...' },
  { id: 'routes', label: 'Wari Routes', icon: '🗺️', desc: 'Routes, mukam & locations...' },
  { id: 'culture', label: 'Culture & Art', icon: '🎭', desc: 'Bhajans, Kirtan, instruments...' },
  { id: 'research', label: 'Research & Documents', icon: '📚', desc: 'Papers, PDFs, archival material...' },
  { id: 'oral_history', label: 'Oral History', icon: '🎙️', desc: 'Interviews & recorded memories...' },
  { id: 'media', label: 'Photos & Media', icon: '📷', desc: 'Historical photos, videos, audio...' }
];

export const CONTENT_TYPES = [
  { id: 'article', label: 'Article', icon: '✍️' },
  { id: 'pdf', label: 'Document / PDF', icon: '📄' },
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'video', label: 'Video', icon: '🎥' },
  { id: 'audio', label: 'Audio', icon: '🎙️' },
  { id: 'story', label: 'Story', icon: '👥' }
];

export const MOCK_KNOWLEDGE_LIST = [
  {
    id: 'sant-tukaram',
    title: 'Sant Tukaram',
    vernacularTitle: 'संत तुकाराम',
    description: 'Explore the life, teachings, literary contributions and connection of Sant Tukaram with the Wari tradition.',
    categories: ['saints', 'wari_dindi', 'abhanga'],
    contentType: 'article',
    reviewStatus: 'reviewed',
    sourcesCount: 8,
    contributorsCount: 12,
    updatedDate: 'Aug 2026',
    contributor: 'Rameshwar Shastri',
    quickFacts: {
      'Name': 'Sant Tukaram Maharaj',
      'Associated Place': 'Dehu, Maharashtra',
      'Tradition': 'Varkari Sampradaya',
      'Known For': 'Abhang Gatha, Bhakti Movement',
      'Period': '17th Century (1598–1649)'
    },
    sections: [
      { id: 'intro', title: 'Introduction', content: 'Sant Tukaram Maharaj was a 17th-century Marathi poet and sant of the Bhakti movement in Maharashtra. He was part of the egalitarian, personalized Varkari devotional tradition.' },
      { id: 'life', title: 'Life', content: 'Born in Dehu, near Pune, Tukaram was born to Kanakar and Bolhoba. His family owned a retail shop and were engaged in agriculture and trade.' },
      { id: 'teachings', title: 'Teachings', content: 'Tukaram emphasized devotion to Lord Vitthala over rituals and caste barriers. His devotional poetry addresses moral living, inner purity, and social equality.' },
      { id: 'wari-connection', title: 'Connection with Wari', content: 'Tukaram Maharaj expanded the community aspect of the Wari. His Padukas are carried every year in a dedicated Palkhi procession from Dehu to Pandharpur.' }
    ],
    sources: [
      { title: 'Tukaram Gatha Critical Edition', author: 'Dr. V. B. Karandikar', year: '1984', type: 'Academic Publication' },
      { title: 'The History of Varkari Movement', author: 'Prof. S. R. Ranade', year: '2001', type: 'Historical Book' }
    ]
  }
];