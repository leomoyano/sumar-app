CREATE TABLE IF NOT EXISTS public.arca_monotributo_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  effective_from date NOT NULL,
  category text NOT NULL CHECK (category IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K')),
  sort_order integer NOT NULL,
  annual_income_limit numeric NOT NULL,
  service_integrated_tax numeric NOT NULL,
  sipa_contribution numeric NOT NULL,
  health_insurance_contribution numeric NOT NULL,
  service_total numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT arca_monotributo_categories_unique UNIQUE (effective_from, category)
);

ALTER TABLE public.arca_monotributo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ARCA monotributo categories"
ON public.arca_monotributo_categories
FOR SELECT
USING (true);

CREATE TRIGGER update_arca_monotributo_categories_updated_at
BEFORE UPDATE ON public.arca_monotributo_categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.arca_monotributo_categories (
  effective_from,
  category,
  sort_order,
  annual_income_limit,
  service_integrated_tax,
  sipa_contribution,
  health_insurance_contribution,
  service_total
) VALUES
  ('2026-02-01', 'A', 1, 10277988.13, 4780.46, 15616.17, 21990.11, 42386.74),
  ('2026-02-01', 'B', 2, 15058447.71, 9082.88, 17177.79, 21990.11, 48250.78),
  ('2026-02-01', 'C', 3, 21113696.52, 15616.17, 18895.57, 21990.11, 56501.85),
  ('2026-02-01', 'D', 4, 26212853.42, 25495.79, 20785.13, 26133.18, 72414.10),
  ('2026-02-01', 'E', 5, 30833964.37, 47804.60, 22863.64, 31869.73, 102537.97),
  ('2026-02-01', 'F', 6, 38642048.36, 67245.13, 25150.00, 36650.19, 129045.32),
  ('2026-02-01', 'G', 7, 46211109.37, 122379.76, 35210.00, 39518.47, 197108.23),
  ('2026-02-01', 'H', 8, 70113407.33, 350567.04, 49294.00, 47485.89, 447346.93),
  ('2026-02-01', 'I', 9, 78479211.62, 697150.35, 69011.60, 58640.31, 824802.26),
  ('2026-02-01', 'J', 10, 89872640.30, 836580.42, 96616.24, 65810.99, 999007.65),
  ('2026-02-01', 'K', 11, 108357084.05, 1171212.59, 135262.74, 75212.57, 1381687.90)
ON CONFLICT (effective_from, category) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  annual_income_limit = EXCLUDED.annual_income_limit,
  service_integrated_tax = EXCLUDED.service_integrated_tax,
  sipa_contribution = EXCLUDED.sipa_contribution,
  health_insurance_contribution = EXCLUDED.health_insurance_contribution,
  service_total = EXCLUDED.service_total;
