import { useCallback, useEffect, useMemo, useState } from "react";

const CRYPTOYA_BASE_URL = "https://criptoya.com/api";
const USDT_VOLUME = 1;

type DolarQuote = {
  ask?: number;
  bid?: number;
  price?: number;
  timestamp?: number;
  variation?: number;
};

type DolarResponse = {
  oficial?: DolarQuote;
  blue?: DolarQuote;
};

type UsdtProviderQuote = {
  ask: number;
  totalAsk: number;
  bid: number;
  totalBid: number;
  time: number;
};

type UsdtResponse = Record<string, UsdtProviderQuote>;

export type MarketDollarRate = {
  label: string;
  ask: number | null;
  bid: number | null;
  variation: number | null;
  updatedAt: number | null;
};

export type UsdtProviderRank = {
  id: string;
  name: string;
  bid: number;
  totalBid: number;
  ask: number;
  totalAsk: number;
  updatedAt: number;
  rankValue: number;
};

const PROVIDER_LABELS: Record<string, string> = {
  astropay: "AstroPay",
  belo: "Belo",
  binance: "Binance",
  binancep2p: "Binance P2P",
  bitgetp2p: "Bitget P2P",
  bitsoalpha: "Bitso Alpha",
  buenbit: "Buenbit",
  bybit: "Bybit",
  bybitp2p: "Bybit P2P",
  cocoscrypto: "Cocos Crypto",
  decrypto: "Decrypto",
  eldoradop2p: "El Dorado P2P",
  fiwind: "Fiwind",
  lemoncash: "Lemon",
  lemoncashp2p: "Lemon P2P",
  letsbit: "LetsBit",
  mexcp2p: "MEXC P2P",
  okexp2p: "OKX P2P",
  ripio: "Ripio",
  ripioexchange: "Ripio Exchange",
  satoshitango: "SatoshiTango",
  tiendacrypto: "TiendaCrypto",
  wallbit: "Wallbit",
};

const getProviderName = (providerId: string) =>
  PROVIDER_LABELS[providerId] ||
  providerId
    .replace(/p2p/g, " P2P")
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const isP2PProvider = (providerId: string) => providerId.toLowerCase().includes("p2p");

const normalizeDollarRate = (
  label: string,
  quote: DolarQuote | undefined,
): MarketDollarRate => ({
  label,
  ask: quote?.ask ?? quote?.price ?? null,
  bid: quote?.bid ?? null,
  variation: quote?.variation ?? null,
  updatedAt: quote?.timestamp ?? null,
});

const normalizeUsdtProviders = (data: UsdtResponse): UsdtProviderRank[] =>
  Object.entries(data)
    .filter(([id]) => !isP2PProvider(id))
    .map(([id, quote]) => ({
      id,
      name: getProviderName(id),
      bid: quote.bid,
      totalBid: quote.totalBid,
      ask: quote.ask,
      totalAsk: quote.totalAsk,
      updatedAt: quote.time,
      rankValue: quote.totalBid || quote.bid,
    }))
    .filter((provider) => provider.rankValue > 0)
    .sort((a, b) => b.rankValue - a.rankValue);

export const useMarketRates = () => {
  const [dollarRates, setDollarRates] = useState<{
    official: MarketDollarRate;
    blue: MarketDollarRate;
  } | null>(null);
  const [usdtProviders, setUsdtProviders] = useState<UsdtProviderRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dollarResponse, usdtResponse] = await Promise.all([
        fetch(`${CRYPTOYA_BASE_URL}/dolar`),
        fetch(`${CRYPTOYA_BASE_URL}/USDT/ARS/${USDT_VOLUME}`),
      ]);

      if (!dollarResponse.ok || !usdtResponse.ok) {
        throw new Error("Could not load market rates");
      }

      const dollarData = (await dollarResponse.json()) as DolarResponse;
      const usdtData = (await usdtResponse.json()) as UsdtResponse;

      setDollarRates({
        official: normalizeDollarRate("Dólar oficial", dollarData.oficial),
        blue: normalizeDollarRate("Dólar blue", dollarData.blue),
      });
      setUsdtProviders(normalizeUsdtProviders(usdtData));
    } catch (fetchError) {
      console.error("Error loading market rates:", fetchError);
      setError("No se pudieron cargar las cotizaciones de mercado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const bestUsdtProvider = useMemo(() => usdtProviders[0] || null, [usdtProviders]);

  return {
    dollarRates,
    usdtProviders,
    bestUsdtProvider,
    isLoading,
    error,
    refetch: fetchRates,
  };
};
