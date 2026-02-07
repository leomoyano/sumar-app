-- Create budgets table for monthly category limits
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT budgets_user_category_unique UNIQUE (user_id, category),
  CONSTRAINT budgets_category_length CHECK (char_length(category) >= 1 AND char_length(category) <= 50)
);

-- Enable Row Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own budgets"
ON public.budgets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets"
ON public.budgets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
ON public.budgets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
ON public.budgets
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();