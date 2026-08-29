-- Performance indexes for public content listings and hybrid search
-- Run this in Supabase/Postgres to reduce query cost on large content tables.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_contents_verified_status_created_at
    ON public.contents (verified, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_channel_verified_created_at
    ON public.contents (channel_id, verified, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_type_verified_created_at
    ON public.contents (content_type, verified, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_language_verified_created_at
    ON public.contents (language, verified, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_user_created_at
    ON public.contents (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_title_trgm
    ON public.contents USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contents_description_trgm
    ON public.contents USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contents_vernacular_title_trgm
    ON public.contents USING gin (vernacular_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contents_tags_gin
    ON public.contents USING gin (tags jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_contents_created_at_desc
    ON public.contents (created_at DESC);

-- Helpful for the semantic and hybrid list filters used by search
CREATE INDEX IF NOT EXISTS idx_contents_embedding
    ON public.contents USING hnsw (embedding vector_l2_ops)
    WITH (m = 16, ef_construction = 64);
