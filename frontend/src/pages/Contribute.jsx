import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UploadContent } from '../components/contribution/UploadContent';

export const Contribute = () => {
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channel');
  
  return <UploadContent preSelectedChannelId={channelId} />;
};

export default Contribute;