import { useState, useEffect, useCallback } from 'react';
import { DollarRate } from '@/types';
import { DEFAULT_USD_RATE } from '@/lib/format';

// Hook para obtener cotización del dólar blue desde DolarAPI
export const useDollarRate = () => {
  const [rate, setRate] = useState<number>(DEFAULT_USD_RATE);
  const [dollarInfo, setDollarInfo] = useState<DollarRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usando DolarAPI para obtener cotización del dólar blue
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      
      if (!response.ok) {
        throw new Error('Error al obtener cotización');
      }
      
      const data: DollarRate = await response.json();
      setDollarInfo(data);
      setRate(data.venta); // Usamos precio de venta
    } catch (err) {
      setError('No se pudo obtener la cotización. Usando valor por defecto.');
      console.error('Error fetching dollar rate:', err);
      // Mantener el rate por defecto en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return {
    rate,
    dollarInfo,
    isLoading,
    error,
    refetch: fetchRate,
  };
};
