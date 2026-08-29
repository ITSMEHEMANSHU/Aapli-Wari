import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiFile, FiImage, FiMusic, FiVideo } from 'react-icons/fi';

import Badge from './common/Badge';
import Card from './common/Card';

const typeIcons = {
  video: <FiVideo className="text-[#DD6B35]" />,
  image: <FiImage className="text-[#DD6B35]" />,
  audio: <FiMusic className="text-[#DD6B35]" />,
  pdf: <FiFile className="text-[#DD6B35]" />,
  manuscript: <FiFile className="text-[#DD6B35]" />,
  story: <FiFile className="text-[#DD6B35]" />,
};

function StatusBadge({ status, verified }) {
  if (status === 'processing') return <Badge variant="warning">⏳ Processing</Badge>;
  if (status === 'pending_review') return <Badge variant="warning">⏳ Review</Badge>;
  if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
  if (verified) return <Badge variant="success">✓ Verified</Badge>;
  if (status === 'approved') return <Badge variant="info">Approved</Badge>;
  return <Badge variant="default">{status}</Badge>;
}

function MediaPreview({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (item.content_type === 'video') return item.file_url ? <video src={item.file_url} className="w-full h-40 object-cover rounded-lg mb-3 bg-black" preload="metadata" muted /> : <div className="w-full h-40 rounded-lg mb-3 bg-gray-100 flex items-center justify-center text-4xl">🎬</div>;
  if (item.content_type === 'audio') return <div className="w-full mb-3"><div className="w-full h-20 rounded-lg bg-[#FBF5EC] flex items-center justify-center text-3xl mb-2">🎵</div><audio src={item.file_url} controls className="w-full" preload="none" /></div>;
  if (item.content_type === 'image' && item.file_url && !imageFailed) return <img loading="lazy" src={item.file_url} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" onError={() => setImageFailed(true)} />;
  return null;
}

/** Functional content card; styling can be enhanced without changing Explore logic. */
export const ContentCard = ({ item }) => (
  <Link to={`/content/${item.id}`} className="block h-full">
    <Card className="hover:shadow-lg transition cursor-pointer h-full relative">
      {item.status === 'processing' && <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center z-10"><div className="animate-spin text-2xl mb-2">⏳</div><p className="text-xs text-gray-500 font-medium">Processing OCR...</p></div>}
      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2">{typeIcons[item.content_type] || <FiFile className="text-[#DD6B35]" />}<Badge variant="default">{item.content_type}</Badge></div><StatusBadge status={item.status} verified={item.verified} /></div>
      <MediaPreview item={item} />
      <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
      {item.description && <p className="text-gray-600 text-sm line-clamp-2 mt-1">{item.description}</p>}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"><span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><span className="text-xs text-gray-500 flex items-center gap-1"><FiEye size={12} /> View</span></div>
    </Card>
  </Link>
);

export default ContentCard;
