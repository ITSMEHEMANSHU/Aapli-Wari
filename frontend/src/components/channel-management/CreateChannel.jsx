import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../hooks/useAuth';

export const CreateChannel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    palkhiName: '',
    location: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // API call to create channel
    setTimeout(() => {
      setLoading(false);
      navigate('/my-channels');
    }, 1500);
  };

  return (
    <div className="create-channel-page">
      <h1>🚩 Create Palkhi Channel</h1>
      <p>Establish your Palkhi channel on Aapli Wari</p>

      <form onSubmit={handleSubmit} className="create-channel-form">
        <Input
          label="Channel Name"
          placeholder="e.g., Sant Dnyaneshwar Palkhi"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <Input
          label="Palkhi Name"
          placeholder="Name of the Palkhi"
          value={formData.palkhiName}
          onChange={(e) => setFormData({...formData, palkhiName: e.target.value})}
          required
        />

        <Input
          type="textarea"
          label="Description"
          placeholder="Describe your Palkhi channel"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
        />

        <div className="form-row">
          <Input
            label="Location"
            placeholder="City/State"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
          <Input
            label="Established Year"
            placeholder="e.g., 2024"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />
        </div>

        <div className="form-actions">
          <Button variant="outline" onClick={() => navigate(-1)} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Channel
          </Button>
        </div>
      </form>
    </div>
  );
};