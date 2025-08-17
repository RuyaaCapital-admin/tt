import React from "react";
import { Bell, Star, Settings, ArrowUp, ArrowDown } from "lucide-react";
import { formatTimeForTraders, formatArrowIndicator, formatCurrencyValue } from "./FormatUtils";

const CalendarRow = ({ 
  event, 
  userTimezone, 
  language, 
  isInWatchlist, 
  hasAlert, 
  onSetAlert, 
  onToggleFavorite, 
  onQuickAnalysis 
}) => {
  const eventTime = formatTimeForTraders(event.eventTime, userTimezone);
  const arrowIndicator = formatArrowIndicator(event.actualValue, event.forecast);

  // Format actual and forecast values with color coding
  const formatValueWithColor = (actual, forecast, value) => {
    const formattedValue = formatCurrencyValue(value, event.currency);
    let colorClass = 'text-secondary';
    let arrowSymbol = null;

    if (actual && forecast && arrowIndicator) {
      if (arrowIndicator.direction === 'up') {
        colorClass = 'text-green-600';
        arrowSymbol = <ArrowUp className="w-3 h-3 inline ml-1" />;
      } else if (arrowIndicator.direction === 'down') {
        colorClass = 'text-red-600';
        arrowSymbol = <ArrowDown className="w-3 h-3 inline ml-1" />;
      }
    }

    return (
      <span className={`font-mono ${colorClass}`}>
        {formattedValue}
        {arrowSymbol}
      </span>
    );
  };

  const CountryFlag = ({ countryCode }) => {
    if (!countryCode) return null;
    const code = countryCode.toLowerCase();

    if (code === 'eur') {
      return <img src="https://flagcdn.com/w20/eu.png" alt="EUR flag" className="w-5 h-auto rounded-sm shadow-sm" />;
    }
    
    if (code.length !== 2) return null;

    return (
      <img 
        src={`https://flagcdn.com/w20/${code}.png`} 
        alt={`${countryCode} flag`}
        className="w-5 h-auto rounded-sm shadow-sm"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  };

  const ImpactDot = ({ level }) => {
    const getImpactConfig = (level) => {
      switch (level) {
        case 3: return { color: '#ef4444', label: language === 'ar' ? 'تأثير عالي' : 'High impact' };
        case 2: return { color: '#f59e0b', label: language === 'ar' ? 'تأثير متوسط' : 'Medium impact' };
        case 1: return { color: '#6b7280', label: language === 'ar' ? 'تأثير منخفض' : 'Low impact' };
        default: return { color: '#6b7280', label: language === 'ar' ? 'تأثير منخفض' : 'Low impact' };
      }
    };

    const config = getImpactConfig(level);

    return (
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
        aria-label={config.label}
        title={config.label}
      />
    );
  };

  return (
    <>
      {/* Desktop Layout (≥768px) */}
      <tr className="hidden md:table-row border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
        {/* Time Column */}
        <td className="p-3 text-left">
          <span className="font-mono text-sm text-primary">
            {eventTime}
          </span>
        </td>

        {/* Flag + Currency Column */}
        <td className="p-3">
          <div className="flex items-center gap-2">
            <CountryFlag countryCode={event.country} />
            <span className="font-semibold text-xs" style={{ color: '#7cb342' }}>
              {event.currency}
            </span>
          </div>
        </td>

        {/* Event Title Column */}
        <td className="p-3 max-w-xs">
          <h4 className={`text-sm leading-tight ${event.importance === 3 ? 'font-bold' : 'font-medium'} text-primary line-clamp-2`}>
            {event.title}
          </h4>
        </td>

        {/* Actual Column */}
        <td className="p-3 text-right">
          {formatValueWithColor(event.actualValue, event.forecast, event.actualValue)}
        </td>

        {/* Forecast Column */}
        <td className="p-3 text-right">
          <span className="font-mono text-sm text-secondary">
            {formatCurrencyValue(event.forecast, event.currency)}
          </span>
        </td>

        {/* Impact Column */}
        <td className="p-3 text-center">
          <ImpactDot level={event.importance} />
        </td>

        {/* Actions Column (Sticky) */}
        <td className="p-3 sticky right-0 bg-inherit">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetAlert(event)}
              className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
              aria-label={language === 'ar' ? 'إعداد تنبيه' : 'Set alert'}
              title={language === 'ar' ? 'إعداد تنبيه' : 'Set alert'}
            >
              <Bell className="w-4 h-4" style={{ color: hasAlert ? '#7cb342' : '#9ca3af' }} />
            </button>
            <button
              onClick={() => onToggleFavorite(event)}
              className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
              aria-label={language === 'ar' ? 'إضافة/إزالة من المفضلة' : 'Toggle favorite'}
              title={language === 'ar' ? 'إضافة/إزالة من المفضلة' : 'Toggle favorite'}
            >
              <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} style={{ color: isInWatchlist ? '#7cb342' : '#9ca3af' }} />
            </button>
            <button
              onClick={() => onQuickAnalysis(event)}
              className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
              aria-label={language === 'ar' ? 'تحليل سريع' : 'Quick analysis'}
              title={language === 'ar' ? 'تحليل سريع' : 'Quick analysis'}
            >
              <Settings className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Layout (<768px) */}
      <div className="md:hidden neumorphic-pressed p-4 rounded-xl mb-3">
        <div className="flex items-start justify-between mb-2">
          {/* Time Badge */}
          <div className={`neumorphic-inset px-2 py-1 rounded-lg text-xs font-mono ${language === 'ar' ? 'float-right' : 'float-left'}`}>
            {eventTime}
          </div>

          {/* Impact Dot */}
          <ImpactDot level={event.importance} />
        </div>

        <div className="flex items-start gap-3 mb-3">
          {/* Flag + Currency */}
          <div className="flex items-center gap-2">
            <CountryFlag countryCode={event.country} />
            <span className="font-semibold text-xs" style={{ color: '#7cb342' }}>
              {event.currency}
            </span>
          </div>

          {/* Event Title */}
          <h4 className={`flex-1 text-sm leading-tight ${event.importance === 3 ? 'font-bold' : 'font-medium'} text-primary`}>
            {event.title}
          </h4>
        </div>

        {/* Collapsed Actual + Forecast */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-secondary">
            <span className="mr-4">
              <span className="text-muted">A:</span> {formatValueWithColor(event.actualValue, event.forecast, event.actualValue)}
            </span>
            <span>
              <span className="text-muted">F:</span> 
              <span className="font-mono text-secondary ml-1">
                {formatCurrencyValue(event.forecast, event.currency)}
              </span>
            </span>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onSetAlert(event)}
            className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
            aria-label={language === 'ar' ? 'إعداد تنبيه' : 'Set alert'}
          >
            <Bell className="w-4 h-4" style={{ color: hasAlert ? '#7cb342' : '#9ca3af' }} />
          </button>
          <button
            onClick={() => onToggleFavorite(event)}
            className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
            aria-label={language === 'ar' ? 'إضافة/إزالة من المفضلة' : 'Toggle favorite'}
          >
            <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} style={{ color: isInWatchlist ? '#7cb342' : '#9ca3af' }} />
          </button>
          <button
            onClick={() => onQuickAnalysis(event)}
            className="neumorphic-button p-2 rounded-lg transition-all hover:scale-110"
            aria-label={language === 'ar' ? 'تحليل سريع' : 'Quick analysis'}
          >
            <Settings className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarRow;