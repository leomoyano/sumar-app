-- Add CHECK constraints to expenses table
ALTER TABLE public.expenses 
  ADD CONSTRAINT expense_name_length CHECK (length(name) > 0 AND length(name) <= 200),
  ADD CONSTRAINT expense_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT expense_amount_reasonable CHECK (amount <= 999999999999),
  ADD CONSTRAINT expense_tags_limit CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 50);

-- Add CHECK constraints to tags table
ALTER TABLE public.tags
  ADD CONSTRAINT tag_name_length CHECK (length(name) > 0 AND length(name) <= 50);

-- Add CHECK constraints to monthly_tables
ALTER TABLE public.monthly_tables
  ADD CONSTRAINT table_name_length CHECK (length(name) > 0 AND length(name) <= 100);