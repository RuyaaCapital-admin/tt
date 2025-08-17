
import React, { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, Bell, ChevronDown, Sparkles, Calendar as CalendarIcon, X, Star, Settings, Clock, Globe, ArrowUp, ArrowDown } from "lucide-react";
import { format, parseISO, formatInTimeZone } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTheme } from "./ui/Theme";
import { Event } from "@/api/entities";
import { WatchlistItem } from "@/api/entities";
import { Alert } from "@/api/entities";
import { analyzeEconomicEvent } from "@/api/functions";
import { timezones } from "./Translations";
import CalendarRow from "./CalendarRow";
import NewsAlertModal from "./NewsAlertModal"; // Assuming NewsAlertModal is located here

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

const ImpactIndicator = ({ level, className = "" }) => {
  const { language } = useTheme();
  
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
      className={`w-3 h-3 rounded-full ${className}`}
      style={{ backgroundColor: config.color }}
      aria-label={config.label}
      title={config.label}
    />
  );
};

const CountryFlag = ({ countryCode, currency }) => {
  if (!countryCode) return <Globe className="w-4 h-4 text-secondary" />;
  const code = countryCode.toLowerCase();

  const flagElement = code === 'eur' ? (
    <img src="https://flagcdn.com/w20/eu.png" alt="EUR flag" className="w-5 h-auto rounded-sm shadow-sm" />
  ) : code.length === 2 ? (
    <img 
      src={`https://flagcdn.com/w20/${code}.png`} 
      alt={`${countryCode} flag`}
      className="w-5 h-auto rounded-sm shadow-sm"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  ) : (
    <Globe className="w-4 h-4 text-secondary" />
  );

  return (
    <div className="flex items-center gap-2">
      {flagElement}
      <span className="font-semibold text-xs" style={{ color: '#7cb342' }}>
        {currency}
      </span>
    </div>
  );
};

const QuickAnalysisModal = ({ event, isOpen, onClose, userTimezone, language }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event && !analysis) {
      performAnalysis();
    }
  }, [isOpen, event, analysis]); // Added analysis to dependency array to prevent re-fetching on every open if analysis already exists

  const performAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeEconomicEvent({
        eventData: {
          event_name: event.title,
          currency: event.currency,
          previous: event.previous,
          forecast: event.forecast,
          actual_value: event.actualValue,
          event_time: event.eventTime
        },
        language: language,
        userTimezone: userTimezone
      });

      const { data } = response;
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setAnalysis(language === 'ar' ? 'فشل في التحليل' : 'Analysis failed');
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis(language === 'ar' ? 'فشل في التحليل' : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="neumorphic max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            {language === 'ar' ? 'تحليل سريع' : 'Quick Analysis'}
          </h3>
          <button onClick={onClose} className="neumorphic-button p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="neumorphic-inset p-4 rounded-xl mb-4">
          <h4 className="font-semibold text-primary mb-2">{event?.title}</h4>
          <div className="flex items-center gap-4 text-sm text-secondary">
            <CountryFlag countryCode={event?.country} currency={event?.currency} />
            <span>{event && format(parseISO(event.eventTime), "PPp", { locale: language === 'ar' ? ar : enUS })}</span>
          </div>
        </div>

        <div className="neumorphic-inset p-4 rounded-xl">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mr-3" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
              <span className="text-secondary">{language === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}</span>
            </div>
          ) : (
            <div className="text-primary whitespace-pre-wrap leading-relaxed text-sm">
              {analysis || (language === 'ar' ? 'لا يوجد تحليل متاح' : 'No analysis available')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CalendarTable({ onNotificationAdd }) {
  const { language, t } = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(new Set());
  const [eventAlerts, setEventAlerts] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQuickAnalysis, setShowQuickAnalysis] = useState(false); // Renamed from showAnalysisModal
  const [showAlertModal, setShowAlertModal] = useState(false); // New state for alert modal
  const [showAll, setShowAll] = useState(false); // New state for show more/less
  const [filters, setFilters] = useState({ 
    search: "", 
    date: null, 
    importance: [], 
    category: "all"
  });
  const [activeDateFilter, setActiveDateFilter] = useState('all');

  const dateLocale = language === 'ar' ? ar : enUS;
  const isRTL = language === 'ar';

  // Load user's timezone preference
  useEffect(() => {
    const savedTimezone = localStorage.getItem('liirat-timezone') || 
                         Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    setUserTimezone(savedTimezone);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Always load events
      const fetchedEvents = await Event.list('-eventTime');
      setEvents(fetchedEvents);

      // Try to load user data
      try {
        setUserLoading(true);
        const savedSession = localStorage.getItem('liirat-user-session');
        let currentUser = null;
        
        if (savedSession) {
          try {
            currentUser = JSON.parse(savedSession);
            if (currentUser && currentUser.id && currentUser.email) {
              setUser(currentUser);
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error parsing user session:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }

        if (currentUser && currentUser.id) {
          try {
            const userWatchlist = await WatchlistItem.filter({ user_id: currentUser.id, itemType: 'event' });
            setWatchlist(new Set(userWatchlist.map(item => item.event_id)));
            
            const userAlerts = await Alert.filter({ user_id: currentUser.id, isActive: true });
            const alertsMap = {};
            userAlerts.forEach(alert => {
              if (alert.event_id) {
                alertsMap[alert.event_id] = alert;
              }
            });
            setEventAlerts(alertsMap);
          } catch (error) {
            console.error("Error loading user-specific data:", error);
            setWatchlist(new Set());
            setEventAlerts({});
          }
        } else {
          setWatchlist(new Set());
          setEventAlerts({});
        }
      } catch (error) {
        console.log("User not authenticated");
        setUser(null);
        setWatchlist(new Set());
        setEventAlerts({});
      } finally {
        setUserLoading(false);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Enhanced filtering
  useEffect(() => {
    let results = events || [];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter((event) =>
        event.title?.toLowerCase().includes(searchTerm) ||
        event.currency?.toLowerCase().includes(searchTerm) ||
        event.country?.toLowerCase().includes(searchTerm)
      );
    }

    // Importance filter
    if (filters.importance.length > 0) {
      results = results.filter((event) => filters.importance.includes(event.importance));
    }

    // Category filter
    if (filters.category !== 'all') {
      results = results.filter((event) => event.category === filters.category);
    }

    // Date filters
    if (filters.date && activeDateFilter !== 'all') {
      const today = new Date();
      if (activeDateFilter === 'today') {
        const todayStr = today.toDateString();
        results = results.filter((event) => {
          const eventDate = new Date(event.eventTime);
          return eventDate.toDateString() === todayStr;
        });
      }
    }

    results.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
    setFilteredEvents(results);
  }, [events, filters, activeDateFilter]);

  const formatEventTime = (eventTime) => {
    try {
      return formatInTimeZone(parseISO(eventTime), userTimezone, "HH:mm", { locale: dateLocale });
    } catch {
      return format(parseISO(eventTime), "HH:mm", { locale: dateLocale });
    }
  };

  const formatActualForecast = (actual, forecast) => {
    if (!actual && !forecast) return null;
    
    const actualStr = actual ? `${actual}` : '-';
    const forecastStr = forecast ? `${forecast}` : '-';
    
    // Determine color and arrow based on comparison
    let color = '#6b7280'; // gray default
    let arrow = null;
    
    if (actual && forecast) {
      const actualNum = parseFloat(actual);
      const forecastNum = parseFloat(forecast);
      
      if (!isNaN(actualNum) && !isNaN(forecastNum)) {
        if (actualNum > forecastNum) {
          color = '#22c55e'; // green
          arrow = <ArrowUp className="w-3 h-3 inline ml-1" aria-hidden="true" />;
        } else if (actualNum < forecastNum) {
          color = '#ef4444'; // red  
          arrow = <ArrowDown className="w-3 h-3 inline ml-1" aria-hidden="true" />;
        }
      }
    }
    
    return { actualStr, forecastStr, color, arrow };
  };

  // This function is now passed to the NewsAlertModal and can be called from there
  const handleSetAlert = (eventId) => {
    if (!user) {
      alert(language === 'ar' ? "يرجى تسجيل الدخول لتعيين التنبيهات." : "Please log in to set alerts.");
      return;
    }
    // This part of the logic might change depending on how NewsAlertModal handles actual alert creation.
    // For now, it just triggers a general notification for demonstration.
    const event = events.find(e => e.id === eventId);
    if (event && onNotificationAdd) {
      onNotificationAdd({
        id: Date.now(),
        type: 'alert_set',
        message: language === 'ar' ? `تم تعيين تنبيه للحدث: ${event.title}` : `Alert set for: ${event.title}`,
        timestamp: new Date().toISOString()
      });
    }
    // Ideally, after setting the alert via modal, you'd re-fetch alerts or update state
    // setEventAlerts(prev => ({...prev, [eventId]: {isActive: true, ...newAlertDetails}}));
  };

  const toggleWatchlist = async (eventId) => { // Renamed from handleToggleFavorite
    if (!user) {
      alert(language === 'ar' ? "يرجى تسجيل الدخول لإدارة قائمة المتابعة." : "Please log in to manage your watchlist.");
      return;
    }

    try {
      const newWatchlist = new Set(watchlist);
      const existingItems = await WatchlistItem.filter({ user_id: user.id, event_id: eventId });
      const existingItem = existingItems.length > 0 ? existingItems[0] : null;

      if (existingItem) {
        await WatchlistItem.delete(existingItem.id);
        newWatchlist.delete(eventId);
      } else {
        await WatchlistItem.create({
          user_id: user.id,
          event_id: eventId,
          itemType: 'event'
        });
        newWatchlist.add(eventId);
      }
      setWatchlist(newWatchlist);

      const event = events.find(e => e.id === eventId);
      if (event && onNotificationAdd) {
        onNotificationAdd({
          id: Date.now(),
          type: 'watchlist_updated',
          message: language === 'ar' ?
            `${newWatchlist.has(eventId) ? 'تم إضافة' : 'تم إزالة'} ${event.title} ${newWatchlist.has(eventId) ? 'إلى' : 'من'} قائمة المتابعة` :
            `${event.title} ${newWatchlist.has(eventId) ? 'added to' : 'removed from'} watchlist`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  // handleQuickAnalysis now just sets the selected event and opens the modal
  const handleQuickAnalysis = (event) => {
    setSelectedEvent(event);
    setShowQuickAnalysis(true);
  };

  const handleImportanceToggle = (level) => {
    setFilters(prevFilters => {
      const newImportance = new Set(prevFilters.importance);
      if (newImportance.has(level)) {
        newImportance.delete(level);
      } else {
        newImportance.add(level);
      }
      return { ...prevFilters, importance: Array.from(newImportance) };
    });
  };

  const uniqueCategories = [...new Set(events.map(e => e.category))].filter(Boolean);
  const importanceLevels = [
    { label: t.high, value: 3 },
    { label: t.medium, value: 2 },
    { label: t.low, value: 1 },
  ];

  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6);

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto fade-in">
        <div className="neumorphic p-6 lg:p-8 mb-8 rounded-3xl">
          <h3 className="text-2xl lg:text-3xl font-bold mb-2 service-title">
            {t.calendarTitle}
          </h3>
          <p className="text-secondary mb-6">{t.calendarDescription}</p>

          {/* Timezone Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">{t.timezone}</span>
            </div>
            <select
              value={userTimezone}
              onChange={(e) => {
                setUserTimezone(e.target.value);
                localStorage.setItem('liirat-timezone', e.target.value);
              }}
              className="neumorphic-pressed px-3 py-2 rounded-xl outline-none bg-transparent text-primary text-sm"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Enhanced Search */}
          <div className="mb-4">
            <div className="neumorphic-pressed p-3 rounded-xl flex items-center">
              <Search className="w-5 h-5 text-gray-500 mx-3" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent outline-none text-primary placeholder-gray-500 py-2"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center mb-4">
            {['all', 'today'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveDateFilter(filter);
                  setFilters((f) => ({ ...f, date: filter === 'today' ? new Date() : null }));
                }}
                className={`neumorphic-button px-3 py-2.5 rounded-xl transition-all text-sm ${activeDateFilter === filter ? 'neumorphic-pressed' : ''}`}
              >
                {t[filter]}
              </button>
            ))}

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="neumorphic-button px-3 py-2.5 rounded-xl outline-none bg-transparent text-sm"
            >
              <option value="all">{t.category}: {t.all}</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{t[cat] || cat}</option>
              ))}
            </select>
          </div>
          
          {/* Multi-select Importance Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-secondary mr-2">{t.importance}:</span>
            <div className="neumorphic-button p-1 rounded-xl flex items-center justify-center gap-1 flex-wrap">
              {importanceLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => handleImportanceToggle(level.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filters.importance.includes(level.value) ? 'neumorphic-pressed' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50'}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Refresh */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">
              {filteredEvents.length} {filteredEvents.length === 1 ? t.eventSingular : t.eventPlural}
              {filters.search && ` ${language === 'ar' ? 'لـ' : 'for'} "${filters.search}"`}
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="neumorphic-button px-4 py-2 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm"
              style={{ color: '#7cb342' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? t.updating : t.updateNow}</span>
            </button>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="neumorphic p-0 rounded-2xl overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {loading ? (
            <LoadingSkeleton />
          ) : displayedEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                {t.noEventsFound || "No Events Found"}
              </h3>
              <p className="text-secondary">
                {language === 'ar' ? 'لا توجد أحداث تطابق البحث' : 'No events match your search'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="p-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'الوقت' : 'Time'}
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'العملة' : 'Currency'}
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'الحدث' : 'Event'}
                      </th>
                      <th className="p-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'الفعلي' : 'Actual'}
                      </th>
                      <th className="p-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'المتوقع' : 'Forecast'}
                      </th>
                      <th className="p-3 text-center text-xs font-semibold text-secondary uppercase tracking-wider">
                        {language === 'ar' ? 'التأثير' : 'Impact'}
                      </th>
                      <th className="p-3 text-center text-xs font-semibold text-secondary uppercase tracking-wider sticky right-0 bg-inherit">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEvents.map((event) => (
                      <CalendarRow
                        key={event.id}
                        event={event}
                        userTimezone={userTimezone}
                        language={language}
                        isInWatchlist={watchlist.has(event.id)}
                        hasAlert={!!eventAlerts[event.id]}
                        onSetAlert={(eventObj) => {
                          setSelectedEvent(eventObj);
                          setShowAlertModal(true);
                        }}
                        onToggleFavorite={toggleWatchlist} // Pass the function directly
                        onQuickAnalysis={(eventObj) => {
                          setSelectedEvent(eventObj);
                          setShowQuickAnalysis(true);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {displayedEvents.map((event) => {
                  const formatted = formatActualForecast(event.actualValue, event.forecast);
                  return (
                    <div key={event.id} className="neumorphic-pressed p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`text-xs font-medium px-2 py-1 rounded-lg neumorphic-inset ${isRTL ? 'float-right' : 'float-left'}`}>
                          {formatEventTime(event.eventTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode={event.country} currency={event.currency} />
                          <ImpactIndicator level={event.importance} />
                        </div>
                      </div>
                      
                      <h4 className={`font-bold text-primary mb-2 ${event.importance === 3 ? 'text-lg' : 'text-base'}`}>
                        {event.title}
                      </h4>
                      
                      {formatted && (
                        <div className="text-sm text-secondary mb-3" style={{ color: formatted.color }}>
                          A {formatted.actualStr} | F {formatted.forecastStr}
                          {formatted.arrow}
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowAlertModal(true);
                          }}
                          className="neumorphic-button p-2 rounded-xl transition-all hover:scale-110"
                          aria-label={language === 'ar' ? 'تعيين تنبيه' : 'Set alert'}
                        >
                          <Bell className="w-4 h-4" style={{ color: eventAlerts[event.id] ? '#7cb342' : '#9ca3af' }} />
                        </button>
                        <button
                          onClick={() => toggleWatchlist(event.id)}
                          className="neumorphic-button p-2 rounded-xl transition-all hover:scale-110"
                          aria-label={language === 'ar' ? 'إضافة للمفضلة' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${watchlist.has(event.id) ? 'fill-current' : ''}`} style={{ color: watchlist.has(event.id) ? '#7cb342' : '#9ca3af' }} />
                        </button>
                        <button
                          onClick={() => handleQuickAnalysis(event)}
                          className="neumorphic-button p-2 rounded-xl transition-all hover:scale-110"
                          aria-label={language === 'ar' ? 'تحليل سريع' : 'Quick analysis'}
                        >
                          <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Show More/Less Button */}
          {filteredEvents.length > 6 && (
            <div className="text-center p-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="neumorphic-button px-6 py-3 font-semibold rounded-xl transition-all hover:scale-105"
                style={{ color: '#7cb342' }}
              >
                {showAll ? t.showLess : `${t.showMore} (${filteredEvents.length - 6})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewsAlertModal
        event={selectedEvent}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSetAlert={handleSetAlert} // Pass the handler from CalendarTable
        existingAlerts={eventAlerts}
      />

      <QuickAnalysisModal
        event={selectedEvent}
        isOpen={showQuickAnalysis}
        onClose={() => setShowQuickAnalysis(false)}
        userTimezone={userTimezone}
        language={language}
      />

      <style jsx>{`
        .sticky-actions {
          position: sticky;
          ${isRTL ? 'left: 0;' : 'right: 0;'}
          background: var(--bg-card); /* Inherit background from parent */
          z-index: 1;
        }
        
        @media (max-width: 767px) {
          .sticky-actions {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
