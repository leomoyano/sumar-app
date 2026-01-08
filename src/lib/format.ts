// Utilidades de formateo para moneda argentina y USD

export const formatARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Valor placeholder para cotización USD (se reemplazará con API real)
export const DEFAULT_USD_RATE = 1200; // ARS por 1 USD

export const convertARStoUSD = (amountARS: number, rate: number = DEFAULT_USD_RATE): number => {
  return amountARS / rate;
};

export const convertUSDtoARS = (amountUSD: number, rate: number = DEFAULT_USD_RATE): number => {
  return amountUSD * rate;
};
