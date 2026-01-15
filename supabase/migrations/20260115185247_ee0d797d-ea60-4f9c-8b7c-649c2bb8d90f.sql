-- Add tags array column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tags text[] DEFAULT '{}'::text[];

-- Migrate existing tags from tags table to profiles
UPDATE public.profiles p
SET tags = (
  SELECT COALESCE(array_agg(t.name ORDER BY t.name), '{}'::text[])
  FROM public.tags t
  WHERE t.user_id = p.user_id
);

-- Drop the tags table
DROP TABLE IF EXISTS public.tags;