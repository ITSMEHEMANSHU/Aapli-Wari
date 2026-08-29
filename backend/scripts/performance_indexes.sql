-- Index for fast channel listing by status and date
CREATE INDEX IF NOT EXISTS idx_channels_status_created_at 
ON channels (status, created_at DESC);

-- Index for fast follower lookups
CREATE INDEX IF NOT EXISTS idx_channel_followers_channel_user 
ON channel_followers (channel_id, user_id);

-- Index for fast contributor lookups
CREATE INDEX IF NOT EXISTS idx_channel_contributors_channel_user 
ON channel_contributors (channel_id, user_id);

-- Index for channel-palkhi joins
CREATE INDEX IF NOT EXISTS idx_channels_palkhi_id 
ON channels (palkhi_id);

-- Index for join request queries (already partially exists, ensure coverage)
CREATE INDEX IF NOT EXISTS idx_channel_join_requests_channel_user_status 
ON channel_join_requests (channel_id, user_id, status);
