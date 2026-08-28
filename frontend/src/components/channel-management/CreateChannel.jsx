import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../services/api';

export const CreateChannel = () => {
  const navigate = useNavigate();

  const [palkhi, setPalkhi] = useState(null);
  const [loadingPalkhi, setLoadingPalkhi] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const loadPalkhi = async () => {
      try {
        setLoadingPalkhi(true);
        setError('');

        const data = await api.myPalkhi();

        setPalkhi(data);
      } catch (err) {
        setError(
          err.message || 'Unable to load your Palkhi'
        );
      } finally {
        setLoadingPalkhi(false);
      }
    };

    loadPalkhi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!palkhi) {
      setError('Your Palkhi could not be found.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const channel = await api.createChannel({
        name: formData.name,
        description: formData.description,
        palkhi_id: palkhi.id,
      });

      navigate(`/channel/${channel.id}`);
    } catch (err) {
      setError(
        err.message || 'Failed to create channel'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingPalkhi) {
    return (
      <div className="py-10 text-center">
        Loading your Palkhi...
      </div>
    );
  }

  return (
    <div className="create-channel-page">

      <h1>Create Palkhi Channel</h1>

      <p>
        Create the channel for your Palkhi.
      </p>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {palkhi && (
        <div className="mb-6">
          <strong>Palkhi:</strong> {palkhi.name}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="create-channel-form"
      >

        <Input
          label="Channel Name"
          placeholder="Enter channel name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          required
        />

        <Input
          type="textarea"
          label="Description"
          placeholder="Describe your Palkhi channel"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          rows={4}
        />

        <div className="form-actions">

          <Button
            variant="outline"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            disabled={!palkhi}
          >
            Create Channel
          </Button>

        </div>

      </form>
    </div>
  );
};

export default CreateChannel;