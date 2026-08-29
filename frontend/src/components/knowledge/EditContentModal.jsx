import React, { useState, useEffect } from 'react';
import { CATEGORIES } from './data/knowledgeData';
import api from '../../services/api';

const FILE_ACCEPT = {
    image: 'image/jpeg,image/png,image/gif,image/webp',
    video: 'video/mp4,video/mpeg,video/quicktime',
    audio: 'audio/mpeg,audio/wav,audio/ogg',
    pdf: 'application/pdf',
    manuscript: 'application/pdf,image/jpeg,image/png',
    short: 'video/mp4,video/mpeg,video/quicktime',
};

function ExistingMedia({ item, previewUrl, selectedFile }) {
    if (!item?.file_url && !previewUrl) return null;

    const source = previewUrl || item.file_url;
    const type = selectedFile?.type || '';
    const contentType = item.content_type;
    const isImage = type.startsWith('image/') || contentType === 'image';
    const isVideo = type.startsWith('video/') || contentType === 'video' || contentType === 'short';
    const isAudio = type.startsWith('audio/') || contentType === 'audio';

    return (
        <div className="rounded-xl border border-[#E8D9C3] bg-[#FBF5EC]/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#2B1B12]">
                    {previewUrl ? 'New file preview' : 'Current file'}
                </span>
                {!previewUrl && (
                    <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#DD6B35] hover:underline"
                    >
                        Open file
                    </a>
                )}
            </div>
            {isImage ? (
                <img src={source} alt={item.title} className="max-h-64 w-full rounded-lg object-contain bg-black/5" />
            ) : isVideo ? (
                <video src={source} controls className="max-h-64 w-full rounded-lg bg-black" />
            ) : isAudio ? (
                <audio src={source} controls className="w-full" />
            ) : (
                <iframe
                    src={source}
                    title={`${item.title} document`}
                    className="h-64 w-full rounded-lg border border-[#E8D9C3] bg-white"
                />
            )}
            {previewUrl && <p className="text-[11px] text-[#4A392E]/70">This file will replace the current upload when you save.</p>}
        </div>
    );
}

export const EditContentModal = ({ isOpen, onClose, contentId, onSaved }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [vernacularTitle, setVernacularTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contentBody, setContentBody] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tags, setTags] = useState('');
    const [item, setItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [fileError, setFileError] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl('');
            return undefined;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // Fetch current content when modal opens
    useEffect(() => {
        if (!isOpen || !contentId) return;
        const fetchContent = async () => {
            setFetching(true);
            setError(null);
            try {
                const item = await api.getContent(contentId);
                setItem(item);
                setSelectedFile(null);
                setFileError(null);
                setTitle(item.title || '');
                setVernacularTitle(item.vernacular_title || '');
                setDescription(item.description || '');
                setContentBody(item.content_body || '');
                setSelectedCategories(item.categories || []);
                setTags((item.tags || []).join(', '));
            } catch (err) {
                setError('Could not load content.');
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchContent();
    }, [isOpen, contentId]);

    const handleClose = () => {
        if (!loading) onClose();
    };

    const toggleCategory = (catId) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        if (!file || !item) {
            setSelectedFile(null);
            setFileError(null);
            return;
        }

        const allowedTypes = FILE_ACCEPT[item.content_type]?.split(',') || [];
        if (!allowedTypes.includes(file.type)) {
            event.target.value = '';
            setSelectedFile(null);
            setFileError(`Please choose a ${item.content_type} file matching the original upload type.`);
            return;
        }

        setFileError(null);
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCategories.length === 0) {
            alert('Please select at least one category.');
            return;
        }
        if (selectedFile && !FILE_ACCEPT[item?.content_type]?.split(',').includes(selectedFile.type)) {
            setFileError(`Please choose a ${item?.content_type} file matching the original upload type.`);
            return;
        }

        const data = {
            title,
            vernacular_title: vernacularTitle,
            description,
            content_body: contentBody,
            categories: selectedCategories,
            tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            setLoading(true);
            await api.updateContent(contentId, data);
            if (selectedFile) {
                const fileData = new FormData();
                fileData.append('file', selectedFile);
                await api.replaceContentFile(contentId, fileData);
            }
            alert('Content updated successfully!');
            onSaved(); // refresh parent list
            onClose();
        } catch (err) {
            alert(err.message || 'Update failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-serif font-bold text-[#2B1B12]">Edit Content</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close edit form"
                        className="h-8 w-8 rounded-full text-lg text-[#4A392E] hover:bg-[#F5EAD9] disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                {fetching ? (
                    <div className="text-center py-10 text-sm">Loading content...</div>
                ) : error ? (
                    <div className="text-red-600 text-sm">{error}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ExistingMedia item={item} previewUrl={previewUrl} selectedFile={selectedFile} />

                        {item?.file_url && FILE_ACCEPT[item.content_type] && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                    Replace {item.content_type === 'image' ? 'Photo' : item.content_type} (optional)
                                </label>
                                <input
                                    type="file"
                                    accept={FILE_ACCEPT[item.content_type]}
                                    onChange={handleFileChange}
                                    className="w-full p-2 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl"
                                />
                                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                                required
                            />
                        </div>

                        {/* Vernacular Title */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Vernacular Title
                            </label>
                            <input
                                type="text"
                                value={vernacularTitle}
                                onChange={(e) => setVernacularTitle(e.target.value)}
                                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Categories <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-[#E8D9C3] bg-[#FBF5EC]/30 rounded-xl">
                                {CATEGORIES.map(cat => {
                                    const isChecked = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition border ${isChecked
                                                ? 'bg-[#DD6B35] text-white border-[#DD6B35]'
                                                : 'bg-white text-[#2B1B12] border-[#E8D9C3] hover:border-[#DD6B35]/50'
                                                }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Short Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows="2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                                required
                            />
                        </div>

                        {/* Article Body */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Article Body
                            </label>
                            <textarea
                                rows="6"
                                value={contentBody}
                                onChange={(e) => setContentBody(e.target.value)}
                                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. history, temple, abhanga"
                                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-[#DD6B35] hover:bg-[#C85A28] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-5 py-2.5 bg-[#F5EAD9] hover:bg-[#E8D9C3] text-[#4A392E] text-xs font-bold rounded-xl transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};