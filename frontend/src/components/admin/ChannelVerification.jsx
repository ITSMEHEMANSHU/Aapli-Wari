import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ChannelVerification = () => {
  const [pendingChannels, setPendingChannels] = useState([
    { id: 1, name: 'Sant Eknath Palkhi', submittedBy: 'John Doe', date: '2026-08-25', description: 'Preserving the legacy of Sant Eknath' },
    { id: 2, name: 'Wari Heritage Foundation', submittedBy: 'Jane Smith', date: '2026-08-24', description: 'Promoting Wari culture worldwide' },
    { id: 3, name: 'Pandharpur Vithal Mandal', submittedBy: 'Rahul Patil', date: '2026-08-23', description: 'Dedicated to Lord Vithal' },
  ]);

  const handleVerify = (id) => {
    setPendingChannels(pendingChannels.filter(c => c.id !== id));
    alert('✅ Channel verified successfully!');
  };

  const handleReject = (id) => {
    setPendingChannels(pendingChannels.filter(c => c.id !== id));
    alert('❌ Channel rejected.');
  };

  return (
    <div className="channel-verification">
      <h1>Channel Verification</h1>
      
      {pendingChannels.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '20px' }}>✅ No channels pending verification</p>
        </Card>
      ) : (
        pendingChannels.map(channel => (
          <Card key={channel.id} className="pending-channel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{channel.name}</h3>
                <p style={{ margin: '0', color: '#666' }}>{channel.description}</p>
                <small>Submitted by: {channel.submittedBy} • {channel.date}</small>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="primary" onClick={() => handleVerify(channel.id)}>
                  ✅ Verify
                </Button>
                <Button variant="outline" onClick={() => handleReject(channel.id)}>
                  ❌ Reject
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};