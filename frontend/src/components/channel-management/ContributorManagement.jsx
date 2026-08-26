import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';

export const ContributorManagement = () => {
  const { id } = useParams();
  const [contributors, setContributors] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', role: 'contributor' },
    { id: 2, name: 'Priya Patel', email: 'priya@email.com', role: 'contributor' },
  ]);
  const [newContributor, setNewContributor] = useState('');

  const addContributor = () => {
    if (newContributor.trim()) {
      setContributors([...contributors, { id: Date.now(), name: newContributor, email: '', role: 'contributor' }]);
      setNewContributor('');
    }
  };

  const removeContributor = (id) => {
    setContributors(contributors.filter(c => c.id !== id));
  };

  return (
    <div className="contributor-management">
      <h1>Contributor Management</h1>
      
      <div className="add-contributor">
        <Input
          placeholder="Enter email to add contributor"
          value={newContributor}
          onChange={(e) => setNewContributor(e.target.value)}
        />
        <Button onClick={addContributor}>Add Contributor</Button>
      </div>

      <div className="contributor-list">
        {contributors.map(contributor => (
          <Card key={contributor.id} className="contributor-item">
            <Avatar size="sm" />
            <div>
              <h4>{contributor.name}</h4>
              <small>{contributor.email}</small>
            </div>
            <span className="role-badge">{contributor.role}</span>
            <Button variant="danger" size="sm" onClick={() => removeContributor(contributor.id)}>
              Remove
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};