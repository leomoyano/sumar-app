ALTER TABLE public.fixed_expenses
ADD COLUMN IF NOT EXISTS due_day integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS last_paid_at timestamp with time zone;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_expenses_due_day_check'
  ) THEN
    ALTER TABLE public.fixed_expenses
    ADD CONSTRAINT fixed_expenses_due_day_check
    CHECK (due_day >= 1 AND due_day <= 31);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_expenses_billing_cycle_check'
  ) THEN
    ALTER TABLE public.fixed_expenses
    ADD CONSTRAINT fixed_expenses_billing_cycle_check
    CHECK (billing_cycle = 'monthly');
  END IF;
END $$;
