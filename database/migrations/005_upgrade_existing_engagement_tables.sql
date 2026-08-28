-- Upgrade pre-existing engagement tables. 004 used CREATE TABLE IF NOT EXISTS,
-- which does not alter legacy tables that were already present in Supabase.

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Earlier versions commonly stored the body under `comment`; preserve it if present.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'comment'
    ) THEN
        EXECUTE 'UPDATE public.comments
                 SET text = COALESCE(NULLIF(trim(comment::text), ''''), ''[legacy comment]'')
                 WHERE text IS NULL';
    END IF;
END $$;

UPDATE public.comments SET text = '[legacy comment]' WHERE text IS NULL;
ALTER TABLE public.comments ALTER COLUMN text SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comments_parent_id_fkey'
    ) THEN
        ALTER TABLE public.comments
            ADD CONSTRAINT comments_parent_id_fkey
            FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_comments_content_id ON public.comments (content_id);
CREATE INDEX IF NOT EXISTS ix_comments_parent_id ON public.comments (parent_id);

-- Keep the download tracker compatible with any older table created before 004.
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS content_id UUID;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS ix_downloads_content_id ON public.downloads (content_id);
