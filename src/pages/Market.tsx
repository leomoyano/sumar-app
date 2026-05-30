import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  RefreshCw,
  Trophy,
  WalletCards,
  Landmark,
  BadgeDollarSign,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketRates, MarketDollarRate, UsdtProviderRank } from "@/hooks/useMarketRates";
import { formatARS } from "@/lib/format";

const SELECTED_PROVIDERS_STORAGE_KEY = "market-selected-usdt-providers";
const DEFAULT_SELECTED_PROVIDER_IDS = ["belo", "lemoncash", "buenbit", "ripio", "binance"];

const formatPercent = (value: number | null) => {
  if (value === null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const formatUpdatedAt = (timestamp: number | null) => {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
};

const parseNumberInput = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getProviderInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const RateCard = ({
  title,
  description,
  rate,
  icon: Icon,
}: {
  title: string;
  description: string;
  rate: MarketDollarRate | null;
  icon: typeof Landmark;
}) => (
  <Card className="overflow-hidden border-primary/10 bg-card/90 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">{title}</p>
          </div>
          <p className="text-3xl font-black tabular-nums">
            {rate?.ask ? formatARS(rate.ask) : "-"}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {formatPercent(rate?.variation ?? null)}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>Compra: {rate?.bid ? formatARS(rate.bid) : "-"}</span>
        <span>{formatUpdatedAt(rate?.updatedAt ?? null)}</span>
      </div>
    </CardContent>
  </Card>
);

const UsdtRankingRow = ({ provider, index }: { provider: UsdtProviderRank; index: number }) => {
  const isWinner = index === 0;

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 transition-colors ${
        isWinner ? "border-primary/30 bg-primary/10" : "bg-muted/20 hover:bg-muted/40"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
          isWinner ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
        }`}
      >
        {isWinner ? <Trophy className="h-4 w-4" /> : getProviderInitials(provider.name)}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{provider.name}</p>
          <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            #{index + 1}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Venta base: {formatARS(provider.bid)} · {formatUpdatedAt(provider.updatedAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-black tabular-nums">{formatARS(provider.rankValue)}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          totalBid
        </p>
      </div>
    </div>
  );
};

const Market = () => {
  const { language } = useLanguage();
  const { dollarRates, usdtProviders, isLoading, error, refetch } = useMarketRates();
  const [baseAmount, setBaseAmount] = useState("100000");
  const [percentage, setPercentage] = useState("10");
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(SELECTED_PROVIDERS_STORAGE_KEY);
    if (!saved) return DEFAULT_SELECTED_PROVIDER_IDS;

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : DEFAULT_SELECTED_PROVIDER_IDS;
    } catch {
      return DEFAULT_SELECTED_PROVIDER_IDS;
    }
  });

  const calculator = useMemo(() => {
    const amount = parseNumberInput(baseAmount);
    const percent = parseNumberInput(percentage);
    const delta = amount * (percent / 100);

    return {
      delta,
    };
  }, [baseAmount, percentage]);

  const selectedUsdtProviders = useMemo(() => {
    const selectedIds = new Set(selectedProviderIds);
    return usdtProviders
      .filter((provider) => selectedIds.has(provider.id))
      .sort((a, b) => b.rankValue - a.rankValue)
      .slice(0, 5);
  }, [selectedProviderIds, usdtProviders]);

  const bestUsdtProvider = selectedUsdtProviders[0] || null;

  const toggleProvider = (providerId: string, checked: boolean) => {
    setSelectedProviderIds((current) =>
      checked
        ? Array.from(new Set([...current, providerId]))
        : current.filter((id) => id !== providerId),
    );
  };

  useEffect(() => {
    localStorage.setItem(
      SELECTED_PROVIDERS_STORAGE_KEY,
      JSON.stringify(selectedProviderIds),
    );
  }, [selectedProviderIds]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {language === "es" ? "Cotizaciones y cálculo rápido" : "Rates and quick math"}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-foreground">Mercado</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {language === "es"
                  ? "Una vista rápida para decidir dónde vender USDT y tener a mano dólar oficial, blue y porcentajes."
                  : "A quick view to decide where to sell USDT and keep official, blue and percentage math handy."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
            <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <RateCard
            title="Dólar oficial"
            description={language === "es" ? "Precio de venta informado por CryptoYa." : "Sell price from CryptoYa."}
            rate={dollarRates?.official ?? null}
            icon={Landmark}
          />
          <RateCard
            title="Dólar blue"
            description={language === "es" ? "Referencia informal para comparar pesos." : "Informal reference for ARS comparison."}
            rate={dollarRates?.blue ?? null}
            icon={BadgeDollarSign}
          />
          <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary-foreground/75">
                    <WalletCards className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em]">
                      Mejor venta USDT
                    </p>
                  </div>
                  <p className="text-3xl font-black tabular-nums">
                    {bestUsdtProvider ? formatARS(bestUsdtProvider.rankValue) : "-"}
                  </p>
                  <p className="text-xs text-primary-foreground/75">
                    {bestUsdtProvider
                      ? `1 USDT en ${bestUsdtProvider.name}`
                      : language === "es"
                        ? "Elegí al menos una wallet"
                        : "Choose at least one wallet"}
                  </p>
                </div>
                <div className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">
                  Top 1
                </div>
              </div>
              <div className="mt-5 border-t border-primary-foreground/20 pt-3 text-xs text-primary-foreground/75">
                Ordenado por totalBid · volumen base 1 USDT
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {language === "es" ? "Tus mejores wallets para vender 1 USDT" : "Your best wallets to sell 1 USDT"}
                  </CardTitle>
                  <CardDescription>
                    {language === "es"
                      ? "Sin P2P. Comparamos sólo entre las empresas que elegiste."
                      : "No P2P. We compare only the providers you chose."}
                  </CardDescription>
                </div>
                <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <WalletCards className="h-4 w-4" />
                      {language === "es" ? "Elegir wallets" : "Choose wallets"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {language === "es" ? "Wallets a comparar" : "Wallets to compare"}
                      </DialogTitle>
                      <DialogDescription>
                        {language === "es"
                          ? "Marcá las empresas que usás. Guardamos esta selección en este navegador."
                          : "Select the providers you use. This selection is saved in this browser."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                      {usdtProviders.map((provider) => {
                        const checked = selectedProviderIds.includes(provider.id);

                        return (
                          <label
                            key={provider.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm transition-colors hover:bg-muted/30"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">
                                1 USDT = {formatARS(provider.rankValue)}
                              </p>
                            </div>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => toggleProvider(provider.id, value === true)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {isLoading && usdtProviders.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              ) : (
                selectedUsdtProviders.length > 0 ? (
                  selectedUsdtProviders.map((provider, index) => (
                  <UsdtRankingRow key={provider.id} provider={provider} index={index} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {language === "es"
                      ? "Seleccioná al menos una wallet para armar tu ranking."
                      : "Select at least one wallet to build your ranking."}
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                {language === "es" ? "Cuánto es el porcentaje" : "Percentage amount"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Calculá cuánto representa X% de un número."
                  : "Calculate what X% of a number is."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="market-base-amount">
                  {language === "es" ? "Monto base" : "Base amount"}
                </Label>
                <Input
                  id="market-base-amount"
                  inputMode="decimal"
                  value={baseAmount}
                  onChange={(event) => setBaseAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-percentage">
                  {language === "es" ? "Porcentaje" : "Percentage"}
                </Label>
                <Input
                  id="market-percentage"
                  inputMode="decimal"
                  value={percentage}
                  onChange={(event) => setPercentage(event.target.value)}
                />
              </div>

              <div className="grid gap-3 pt-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "es"
                      ? `${percentage || 0}% de ${baseAmount || 0}`
                      : `${percentage || 0}% of ${baseAmount || 0}`}
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums">
                    {formatARS(calculator.delta)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Market;
