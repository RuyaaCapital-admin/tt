// Format utilities for calendar data

export const formatArrowIndicator = (actual, forecast) => {
  if (!actual || !forecast) return null;
  
  const actualNum = parseFloat(actual);
  const forecastNum = parseFloat(forecast);
  
  if (isNaN(actualNum) || isNaN(forecastNum)) return null;
  
  if (actualNum > forecastNum) {
    return { direction: 'up', symbol: '↑', color: '#22c55e' };
  } else if (actualNum < forecastNum) {
    return { direction: 'down', symbol: '↓', color: '#ef4444' };
  }
  
  return null;
};

export const formatTimeForTraders = (dateTime, timezone = 'UTC') => {
  try {
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    }).format(date);
  } catch (error) {
    return '--:--';
  }
};

export const getImpactLevel = (importance) => {
  switch (importance) {
    case 3: return { level: 'high', color: '#ef4444', label: 'High Impact' };
    case 2: return { level: 'medium', color: '#f59e0b', label: 'Medium Impact' };
    case 1: return { level: 'low', color: '#6b7280', label: 'Low Impact' };
    default: return { level: 'low', color: '#6b7280', label: 'Low Impact' };
  }
};

export const formatCurrencyValue = (value, currency) => {
  if (!value) return '-';
  
  // Handle percentage values
  if (typeof value === 'string' && value.includes('%')) {
    return value;
  }
  
  // Handle numeric values
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  // Format based on currency type
  if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    return new Intl.NumberFormat('en-US').format(numValue);
  }
  
  return value;
};