import { useCallback, useEffect, useState } from "react";

const CRYPTOYA_DOLAR_URL = "https://criptoya.com/api/dolar";
const DEFAULT_OFFICIAL_DOLLAR = 1430;

type DolarResponse = {
  oficial?: {
    ask?: number;
    price?: number;
    timestamp?: number;
  };
};

export const useOfficialDollarRate = () => {
  const [rate, setRate] = useState(DEFAULT_OFFICIAL_DOLLAR);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(CRYPTOYA_DOLAR_URL);
      if (!response.ok) throw new Error("Could not load official dollar rate");

      const data = (await response.json()) as DolarResponse;
      const officialRate = data.oficial?.ask || data.oficial?.price;

      if (officialRate) {
        setRate(officialRate);
        setUpdatedAt(data.oficial?.timestamp || null);
      }
    } catch (error) {
      console.warn("Using default official dollar rate:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return {
    rate,
    updatedAt,
    isLoading,
    refetch: fetchRate,
  };
};
