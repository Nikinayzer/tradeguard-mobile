/**
 * Format a number as currency (USD)
 * @param value Number to format
 * @param minimumFractionDigits Minimum number of fraction digits (default: 2)
 * @param maximumFractionDigits Maximum number of fraction digits (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(value);
}

/**
 * Format a number with specified decimal places
 * @param value Number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value / 100);
}

/**
 * Format a number as a compact representation with K/M suffixes
 * @param value Number to format
 * @returns Formatted compact string with K/M suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const absValue = Math.abs(value);
  
  if (absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  
  return `$${value.toFixed(2)}`;
} 