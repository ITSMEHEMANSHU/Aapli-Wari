import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  
  const stats = {
    users: 1523,
    channels: 45,
    content: 320,
    pendingApproval: 12
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid grid-4">
        <Card className="stat-card" style={{ textAlign: 'center' }}>
          <h3>👥 Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.users}</p>
        </Card>
        <Card className="stat-card" style={{ textAlign: 'center' }}>
          <h3>📢 Channels</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.channels}</p>
        </Card>
        <Card className="stat-card" style={{ textAlign: 'center' }}>
          <h3>📚 Content</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.content}</p>
        </Card>
        <Card className="stat-card" style={{ textAlign: 'center' }}>
          <h3>⏳ Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.pendingApproval}</p>
        </Card>
      </div>

      <div className="admin-grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <Card className="recent-activity">
          <h3>Recent Activity</h3>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🆕 New user registered: John Doe</li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>📢 New channel created: Sant Eknath</li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>⚠️ Content flagged for review</li>
            <li style={{ padding: '8px 0' }}>✅ 2 channels verified</li>
          </ul>
        </Card>

        <Card className="quick-actions">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button onClick={() => navigate('/admin/channels')}>Review Pending Channels</Button>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>Manage Users</Button>
            <Button variant="outline" onClick={() => navigate('/admin/content')}>Content Moderation</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};