import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState([
    { id: 1, title: 'Misleading Historical Info', submittedBy: 'User123', reason: 'Inaccurate historical facts', date: '2026-08-25' },
    { id: 2, title: 'Duplicate Content', submittedBy: 'User456', reason: 'Already exists in database', date: '2026-08-24' },
    { id: 3, title: 'Offensive Language', submittedBy: 'User789', reason: 'Contains offensive terms', date: '2026-08-23' },
  ]);

  const handleApprove = (id) => {
    setFlaggedContent(flaggedContent.filter(c => c.id !== id));
    alert('✅ Content kept on platform');
  };

  const handleReject = (id) => {
    setFlaggedContent(flaggedContent.filter(c => c.id !== id));
    alert('❌ Content removed from platform');
  };

  return (
    <div className="content-moderation">
      <h1>Content Moderation</h1>
      
      {flaggedContent.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '20px' }}>✅ No flagged content to moderate</p>
        </Card>
      ) : (
        flaggedContent.map(content => (
          <Card key={content.id} className="flagged-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{content.title}</h3>
                <p style={{ margin: '0', color: '#f44336' }}>⚠️ {content.reason}</p>
                <small>Reported by: {content.submittedBy} • {content.date}</small>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="primary" onClick={() => handleApprove(content.id)}>
                  Keep Content
                </Button>
                <Button variant="danger" onClick={() => handleReject(content.id)}>
                  Remove Content
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};