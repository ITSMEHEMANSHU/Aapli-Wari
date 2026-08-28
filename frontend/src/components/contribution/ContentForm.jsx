import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import { uploadContent } from '../../services/content';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

export const ContentForm = ({ 
  contentType, 
  onBack, 
  onSuccess,
  preSelectedChannelId = null 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'mr',
    tags: '',
    channel_id: preSelectedChannelId || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Fetch user's channels
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) return;
      try {
        setLoadingChannels(true);
        const myChannels = await api.myChannelMemberships();
        const allChannels = await api.channels();
        const memberChannelIds = new Set(myChannels.map(c => c.id));
        const userChannels = allChannels.filter(c => 
          memberChannelIds.has(c.id) || c.created_by_user_id === user.id
        );
        setChannels(userChannels);
      } catch (err) {
        console.error('Failed to load channels:', err);
      } finally {
        setLoadingChannels(false);
      }
    };
    fetchChannels();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description || '');
      formDataObj.append('content_type', contentType);
      formDataObj.append('language', formData.language);
      formDataObj.append('tags', formData.tags);
      if (formData.channel_id) {
        formDataObj.append('channel_id', formData.channel_id);
      }
      if (file) {
        formDataObj.append('file', file);
      }

      const result = await uploadContent(formDataObj, (progress) => {
        setUploadProgress(progress);
      });
      
      console.log('Upload success:', result);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="hover:text-primary transition">
          <FaArrowLeft />
        </button>
        <h3 className="text-xl font-bold">
          {preSelectedChannelId ? 'Post to Channel' : `Upload ${contentType}`}
        </h3>
        {preSelectedChannelId && (
          <Badge variant="primary" className="ml-2">
            Channel Post
          </Badge>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          placeholder="Enter title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload File {contentType !== 'story' && '*'}</label>
        <div 
          className={`border-2 border-dashed p-8 text-center rounded cursor-pointer transition ${
            file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary'
          }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
            accept={
              contentType === 'image' ? 'image/*' :
              contentType === 'video' ? 'video/*' :
              contentType === 'audio' ? 'audio/*' :
              contentType === 'manuscript' ? '.pdf,.jpg,.jpeg,.png' :
              '*/*'
            }
          />
          {file ? (
            <div>
              <p className="font-bold text-green-600">✓ {file.name}</p>
              <small className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
          ) : (
            <div>
              <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
              <p>Click or drag to upload</p>
              <small className="text-gray-500">
                {contentType === 'image' && 'Supported: JPG, PNG, GIF, WebP'}
                {contentType === 'video' && 'Supported: MP4, MPEG, QuickTime'}
                {contentType === 'audio' && 'Supported: MP3, WAV, OGG'}
                {contentType === 'manuscript' && 'Supported: PDF, JPG, PNG'}
                {contentType === 'story' && 'No file needed - just write your story'}
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          placeholder="Describe your content"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({...formData, language: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          >
            <option value="mr">Marathi</option>
            <option value="hi">Hindi</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            placeholder="Enter tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Channel Selection - Hidden if pre-selected */}
      {!preSelectedChannelId && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Channel (Optional)</label>
          <select
            value={formData.channel_id}
            onChange={(e) => setFormData({...formData, channel_id: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          >
            <option value="">No channel (Public - appears in Explore)</option>
            {loadingChannels ? (
              <option disabled>Loading channels...</option>
            ) : (
              channels.map(channel => (
                <option key={channel.id} value={channel.id}>{channel.name}</option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.channel_id 
              ? 'This content will appear in the channel feed' 
              : 'This content will appear in Explore for all users'}
          </p>
        </div>
      )}

      {preSelectedChannelId && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            📢 This content will be posted to the selected channel
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-gray-300 px-6 py-2 rounded hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || (!file && contentType !== 'story')}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-red-800 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : preSelectedChannelId ? 'Post to Channel' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
};