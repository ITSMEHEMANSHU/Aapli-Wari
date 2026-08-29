import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UploadContent } from '../components/contribution/UploadContent';

export const Contribute = () => {
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channel');
  const contentType = searchParams.get('type'); // ✅ Add this

  return <UploadContent preSelectedChannelId={channelId} preSelectedType={contentType} />;
};

export default Contribute;