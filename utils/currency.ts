import { useCallback, useMemo } from 'react';

export const CURRENCY_SYMBOL = 'ZMW';
export const CURRENCY_CODE = 'ZMW';
export const CURRENCY_NAME = 'Zambian Kwacha';

export interface CurrencyFormatOptions {
  decimals?: number;
  compact?: boolean;
  showCode?: boolean;
}

/**
 * Formats a monetary value in Zambian Kwacha (ZMW) format, e.g. "ZMW 1,200.00".
 * Standardized across all financial modules in the SDA Digital Church Register.
 * 
 * Examples:
 *   formatZMW(1200) => "ZMW 1,200.00"
 *   formatZMW(1500.5) => "ZMW 1,500.50"
 *   formatZMW(0) => "ZMW 0.00"
 *   formatZMW(25000, { compact: true }) => "ZMW 25K"
 */
export const formatZMW = (
  amount: number = 0,
  options?: CurrencyFormatOptions
): string => {
  const decimals = options?.decimals ?? 2;
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  if (options?.compact && Math.abs(num) >= 1000) {
    const compactFormatted = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
    return `ZMW ${compactFormatted}`;
  }

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `ZMW ${formatted}`;
};

/**
 * Global utility function for currency formatting (alias for formatZMW)
 */
export const formatCurrency = formatZMW;

/**
 * Backwards-compatible alias for formatKwacha, updated to format as "ZMW 1,200.00"
 */
export const formatKwacha = (
  amount: number = 0,
  options?: CurrencyFormatOptions
): string => {
  return formatZMW(amount, options);
};

/**
 * Custom React Hook `useCurrency` that provides memoized currency formatting
 * functions and currency metadata for components.
 * 
 * Usage in component:
 *   const { formatCurrency, formatZMW, currencyCode } = useCurrency();
 *   <span>{formatCurrency(totalAmount)}</span>
 */
export const useCurrency = () => {
  const format = useCallback(
    (amount: number = 0, options?: CurrencyFormatOptions) => formatZMW(amount, options),
    []
  );

  return useMemo(
    () => ({
      formatCurrency: format,
      formatZMW: format,
      formatKwacha: format,
      currencyCode: CURRENCY_CODE,
      currencySymbol: CURRENCY_SYMBOL,
      currencyName: CURRENCY_NAME,
    }),
    [format]
  );
};

export default formatZMW;

