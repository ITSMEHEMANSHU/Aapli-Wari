import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', role: 'user', status: 'active' },
    { id: 2, name: 'Priya Patel', email: 'priya@email.com', role: 'contributor', status: 'active' },
    { id: 3, name: 'Amit Kumar', email: 'amit@email.com', role: 'user', status: 'suspended' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', role: 'pramukh', status: 'active' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', role: 'user', status: 'active' },
  ]);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' } : user
    ));
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="user-search"
        style={{ marginBottom: '20px' }}
      />

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: user.role === 'admin' ? '#8B1E1E' : 
                               user.role === 'pramukh' ? '#D4A843' : 
                               user.role === 'contributor' ? '#4CAF50' : '#2196F3',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>{user.role}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: user.status === 'active' ? '#4CAF50' : '#f44336'
                  }}>
                    {user.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(user.id)}>
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};