-- Create monthly_tables table
CREATE TABLE public.monthly_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table (user-specific custom tags)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES public.monthly_tables(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  amount_usd DECIMAL(12,2),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.monthly_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly_tables
CREATE POLICY "Users can view own tables"
ON public.monthly_tables FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tables"
ON public.monthly_tables FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tables"
ON public.monthly_tables FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tables"
ON public.monthly_tables FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for tags
CREATE POLICY "Users can view own tags"
ON public.tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
ON public.tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
ON public.tags FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for expenses
CREATE POLICY "Users can view own expenses"
ON public.expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
ON public.expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
ON public.expenses FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_monthly_tables_updated_at
BEFORE UPDATE ON public.monthly_tables
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_monthly_tables_user_id ON public.monthly_tables(user_id);
CREATE INDEX idx_expenses_table_id ON public.expenses(table_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);