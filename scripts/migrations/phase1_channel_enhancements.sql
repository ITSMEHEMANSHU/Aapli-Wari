-- ============================================================
-- PHASE 1: Channel Enhancement Migrations
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Channel Followers Table
CREATE TABLE IF NOT EXISTS public.channel_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT channel_followers_unique UNIQUE (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_followers_channel ON public.channel_followers(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_followers_user ON public.channel_followers(user_id);

-- 2. Announcement + Pinned fields on channel_posts
ALTER TABLE public.channel_posts ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.channel_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Emergency contact fields on palkhis
ALTER TABLE public.palkhis ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE public.palkhis ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE public.palkhis ADD COLUMN IF NOT EXISTS emergency_contact_role VARCHAR(100);

-- 4. Local Coordinators Table (Phase 1 - table only)
CREATE TABLE IF NOT EXISTS public.local_coordinators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    palkhi_id UUID NOT NULL REFERENCES public.palkhis(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    phone VARCHAR(20),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT local_coordinators_unique UNIQUE (palkhi_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_local_coordinators_palkhi ON public.local_coordinators(palkhi_id);
