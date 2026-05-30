import { useCallback, useEffect, useState } from "react";

import {
  MONOTRIBUTO_CATEGORIES_2026,
  MonotributoCategory,
  MonotributoCategoryId,
} from "@/lib/arcaMonotributo";
import { supabase } from "@/integrations/supabase/client";

type RawArcaCategory = {
  category: string;
  annual_income_limit: number;
  service_integrated_tax: number;
  sipa_contribution: number;
  health_insurance_contribution: number;
  service_total: number;
};

const normalizeCategory = (category: RawArcaCategory): MonotributoCategory => ({
  category: category.category as MonotributoCategoryId,
  annualIncomeLimit: Number(category.annual_income_limit),
  serviceIntegratedTax: Number(category.service_integrated_tax),
  sipaContribution: Number(category.sipa_contribution),
  healthInsuranceContribution: Number(category.health_insurance_contribution),
  serviceTotal: Number(category.service_total),
});

export const useArcaCategories = () => {
  const [categories, setCategories] = useState<MonotributoCategory[]>(
    MONOTRIBUTO_CATEGORIES_2026,
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("arca_monotributo_categories")
        .select(
          "category, annual_income_limit, service_integrated_tax, sipa_contribution, health_insurance_contribution, service_total",
        )
        .eq("effective_from", "2026-02-01")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories((data as RawArcaCategory[]).map(normalizeCategory));
      }
    } catch (error) {
      console.warn("Using local ARCA category fallback:", error);
      setCategories(MONOTRIBUTO_CATEGORIES_2026);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    refetch: loadCategories,
  };
};
