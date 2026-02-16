import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "ARS" | "USD";
type ExchangeRateType = "blue" | "official";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRateType: ExchangeRateType;
  setExchangeRateType: (type: ExchangeRateType) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currency, setCurrencyState] = useState<Currency>("ARS");
  const [exchangeRateType, setExchangeRateType] =
    useState<ExchangeRateType>("blue");

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app-currency") as Currency;
    const savedRateType = localStorage.getItem(
      "app-rate-type",
    ) as ExchangeRateType;

    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedRateType) setExchangeRateType(savedRateType);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("app-currency", c);
  };

  const setRateType = (t: ExchangeRateType) => {
    setExchangeRateType(t);
    localStorage.setItem("app-rate-type", t);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRateType,
        setExchangeRateType: setRateType,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
