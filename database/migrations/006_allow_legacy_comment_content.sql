-- Some pre-existing deployments used `comments.content` for the comment body.
-- The application now uses `comments.text`; retain old data but remove the old
-- column's NOT NULL requirement so new comments can be inserted normally.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'content'
    ) THEN
        EXECUTE 'UPDATE public.comments
                 SET text = content::text
                 WHERE (text IS NULL OR text = ''[legacy comment]'') AND content IS NOT NULL';
        ALTER TABLE public.comments ALTER COLUMN content DROP NOT NULL;
    END IF;
END $$;
