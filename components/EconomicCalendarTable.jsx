import React, { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, Bell, ChevronDown, Sparkles, Calendar as CalendarIcon, X, Star, ChevronRight, Clock, Globe } from "lucide-react";
import { format, parseISO, formatInTimeZone } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTheme } from "./ui/Theme";
import { Event } from "@/api/entities";
import { WatchlistItem } from "@/api/entities";
import { Alert } from "@/api/entities";
import { User } from "@/api/entities";
import { analyzeEconomicEvent } from "@/api/functions";
import { timezones } from "./Translations";

const ImportanceIndicator = ({ level }) => {
  const { t } = useTheme();
  const levels = {
    1: { color: '#3b82f6', dots: 1, label: t.low },
    2: { color: '#f59e0b', dots: 2, label: t.medium },
    3: { color: '#ef4444', dots: 3, label: t.high }
  };
  const config = levels[level] || levels[1];

  return (
    <div className="flex items-center gap-1" title={`${t.importance}: ${config.label}`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: i <= config.dots ? config.color : '#d1d5db',
            opacity: i <= config.dots ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};

const CountryFlag = ({ countryCode }) => {
  if (!countryCode) return null;
  const code = countryCode.toLowerCase();

  // Handle Eurozone flag
  if (code === 'eur') {
    return <img src="https://flagcdn.com/w20/eu.png" alt="EUR flag" className="w-5 h-auto rounded-sm shadow-sm" title="Eurozone" />;
  }
  
  // Basic validation for country codes
  if (code.length !== 2) {
    return <Globe className="w-5 h-5 text-secondary" title={countryCode} />;
  }

  return (
    <img 
      src={`https://flagcdn.com/w20/${code}.png`} 
      alt={`${countryCode} flag`}
      className="w-5 h-auto rounded-sm shadow-sm"
      title={countryCode}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
};

const NewsAlertModal = ({ event, isOpen, onClose, onSetAlert, existingAlerts = {} }) => {
  const { language, t } = useTheme();
  const [alertType, setAlertType] = useState('onRelease');
  const [beforeTime, setBeforeTime] = useState('15');
  const [notificationChannel, setNotificationChannel] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const alertKey = `${event?.id}`;
  const hasExistingAlert = existingAlerts[alertKey];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSetAlert({
        event_id: event?.id,
        event_name: event?.title,
        alert_type: alertType,
        before_time: parseInt(beforeTime),
        event_time: event?.eventTime,
        currency: event?.currency,
        notification_channel: notificationChannel
      });
      onClose();
    } catch (error) {
      console.error('Error setting alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="neumorphic max-w-md w-full p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold service-title">{t.setAlert}</h3>
          <button onClick={onClose} className="neumorphic-button p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="neumorphic-pressed p-4 rounded-xl mb-6">
          <h4 className="font-semibold text-primary">{event?.title}</h4>
          <p className="text-sm text-secondary">
            {event && format(parseISO(event.eventTime), "PPp", {
              locale: language === 'ar' ? ar : enUS
            })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ImportanceIndicator level={event?.importance} />
            <span className="text-xs font-medium px-2 py-1 rounded-lg neumorphic-inset">
              {event?.currency}
            </span>
          </div>
        </div>

        {hasExistingAlert && (
          <div className="neumorphic-inset p-4 rounded-xl mb-4 border-l-4" style={{ borderColor: '#7cb342' }}>
            <p className="text-sm font-medium" style={{ color: '#7cb342' }}>
              {t.alertSet}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">{t.alertType}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer neumorphic-inset p-3 rounded-lg">
                <input 
                  type="radio" 
                  name="alertType" 
                  value="onRelease" 
                  checked={alertType === 'onRelease'} 
                  onChange={(e) => setAlertType(e.target.value)} 
                  className="w-4 h-4" 
                />
                <span className="text-primary">{t.on_release}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer neumorphic-inset p-3 rounded-lg">
                <input 
                  type="radio" 
                  name="alertType" 
                  value="beforeRelease" 
                  checked={alertType === 'beforeRelease'} 
                  onChange={(e) => setAlertType(e.target.value)} 
                  className="w-4 h-4" 
                />
                <span className="text-primary">{t.before_release}</span>
              </label>
            </div>
          </div>

          {alertType === 'beforeRelease' && (
            <div className="fade-in">
              <label className="block text-sm font-medium text-primary mb-2">{t.minutesBefore}</label>
              <select
                value={beforeTime}
                onChange={(e) => setBeforeTime(e.target.value)}
                className="w-full neumorphic-pressed p-3 rounded-lg bg-transparent text-primary"
              >
                <option value="15">15 {t.minutes_before}</option>
                <option value="30">30 {t.minutes_before}</option>
                <option value="60">60 {t.minutes_before}</option>
                <option value="120">120 {t.minutes_before}</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary mb-2">{t.notificationChannel}</label>
            <select
              value={notificationChannel}
              onChange={(e) => setNotificationChannel(e.target.value)}
              className="w-full neumorphic-pressed p-3 rounded-lg bg-transparent text-primary"
            >
              <option value="email">{t.email}</option>
              <option value="push">{t.push}</option>
              <option value="whatsapp">{t.whatsapp}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 neumorphic-button px-4 py-3 font-semibold rounded-xl transition-all text-white disabled:opacity-50"
            style={{ backgroundColor: '#7cb342' }}
          >
            {isSubmitting ? t.loading : (hasExistingAlert ? t.changeAlert : t.setAlert)}
          </button>
          <button
            onClick={onClose}
            className="flex-1 neumorphic-button px-4 py-3 text-secondary font-semibold rounded-xl"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

function CalendarTable({ onNotificationAdd }) {
  const { language, t } = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [filters, setFilters] = useState({ 
    search: "", 
    date: null, 
    importance: [], 
    category: "all"
  });
  const [activeDateFilter, setActiveDateFilter] = useState('all');
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [analyzingRow, setAnalyzingRow] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(new Set());
  const [eventAlerts, setEventAlerts] = useState({});
  const [expandedDetails, setExpandedDetails] = useState(new Set());
  const [searchHighlight, setSearchHighlight] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const dateLocale = language === 'ar' ? ar : enUS;

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

      // Try to load user data, but don't fail if not authenticated
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
          // User not authenticated - this is OK
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

  // Click outside listener for search suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  // Enhanced filtering and sorting
  useEffect(() => {
    let results = events || [];

    // Search filter with highlighting
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      setSearchHighlight(searchTerm);
      results = results.filter((event) =>
        event.title?.toLowerCase().includes(searchTerm) ||
        event.currency?.toLowerCase().includes(searchTerm) ||
        event.country?.toLowerCase().includes(searchTerm)
      );
    } else {
      setSearchHighlight('');
    }

    // Multi-select Importance filter
    if (filters.importance.length > 0) {
      results = results.filter((event) => filters.importance.includes(event.importance));
    }

    // Category filter
    if (filters.category !== 'all') {
      results = results.filter((event) => event.category === filters.category);
    }

    // Date filters
    if (filters.date) {
      const today = new Date();
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      if (activeDateFilter === 'thisWeek') {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        results = results.filter(event => {
          const eventDate = new Date(event.eventTime);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
      } else if (activeDateFilter === 'nextWeek') {
        const startOfNextWeek = new Date(startOfWeek);
        startOfNextWeek.setDate(startOfWeek.getDate() + 7);
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
        endOfNextWeek.setHours(23, 59, 59, 999);
        results = results.filter(event => {
          const eventDate = new Date(event.eventTime);
          return eventDate >= startOfNextWeek && eventDate <= endOfNextWeek;
        });
      } else if (activeDateFilter === 'today') {
        const todayStr = today.toDateString();
        results = results.filter((event) => {
          const eventDate = new Date(event.eventTime);
          return eventDate.toDateString() === todayStr;
        });
      } else if (activeDateFilter === 'custom') {
        const filterDate = new Date(filters.date);
        results = results.filter((event) => {
          const eventDate = new Date(event.eventTime);
          return eventDate.toDateString() === filterDate.toDateString();
        });
      }
    }

    results.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime));

    setFilteredEvents(results);
  }, [events, filters, activeDateFilter]);

  const handleDateFilter = (filterType, date = null) => {
    setActiveDateFilter(filterType);
    setShowWeekDropdown(false);
    if (filterType === 'all') {
      setFilters((f) => ({ ...f, date: null }));
    } else if (filterType === 'today') {
      setFilters((f) => ({ ...f, date: new Date() }));
    } else if (filterType === 'thisWeek' || filterType === 'nextWeek') {
      setFilters((f) => ({ ...f, date: new Date() }));
    } else if (filterType === 'custom' && date) {
      setFilters((f) => ({ ...f, date }));
    }
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

  const updateSearchSuggestions = (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const suggestedEvents = new Set();

    events.forEach(event => {
      if (
        event.title?.toLowerCase().includes(lowerCaseQuery) ||
        event.currency?.toLowerCase().includes(lowerCaseQuery) ||
        (t[event.country] || event.country)?.toLowerCase().includes(lowerCaseQuery)
      ) {
        suggestedEvents.add(event.title);
      }
    });

    setSuggestions(Array.from(suggestedEvents).slice(0, 5));
  };

  const handleAnalysis = async (event) => {
    if (expandedRow === event.id) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(event.id);
    if (!event.analysis) {
      setAnalyzingRow(event.id);
    }

    try {
      if (!event.analysis) {
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
          await Event.update(event.id, {
            analysis: data.analysis,
            analysisDate: new Date().toISOString()
          });
          loadData();
        } else {
          console.error("Analysis failed:", data.error);
        }
      }
    } catch (error) {
      console.error("Error calling analysis function:", error);
    } finally {
      setAnalyzingRow(null);
    }
  };

  const handleSetAlert = async (alertData) => {
    if (!user) {
      alert(language === 'ar' ? "يرجى تسجيل الدخول لتعيين التنبيهات." : "Please log in to set alerts.");
      return;
    }

    try {
      const existingAlert = eventAlerts[alertData.event_id];
      
      if (existingAlert) {
        await Alert.update(existingAlert.id, {
          alertType: alertData.alert_type,
          leadTimeMinutes: alertData.before_time || 0,
          notificationChannels: [alertData.notification_channel]
        });
      } else {
        await Alert.create({
          user_id: user.id,
          event_id: alertData.event_id,
          alertType: alertData.alert_type,
          leadTimeMinutes: alertData.before_time || 0,
          notificationChannels: [alertData.notification_channel],
          isActive: true
        });
      }

      // Show success message
      if (onNotificationAdd) {
        onNotificationAdd({
          id: Date.now(),
          type: 'success',
          message: language === 'ar' ? `تم ضبط التنبيه للحدث: ${alertData.event_name}` : `Alert set for: ${alertData.event_name}`,
          timestamp: new Date().toISOString()
        });
      }
      
      loadData(); // Refresh to show updated alerts
    } catch (error) {
      console.error("Error setting alert:", error);
      alert(language === 'ar' ? "فشل تعيين التنبيه. يرجى المحاولة مرة أخرى." : "Failed to set alert. Please try again.");
    }
  };

  const toggleWatchlist = async (event) => {
    if (!user) {
      alert(language === 'ar' ? "يرجى تسجيل الدخول لإدارة قائمة المتابعة الخاصة بك." : "Please log in to manage your watchlist.");
      return;
    }

    try {
      const newWatchlist = new Set(watchlist);
      const existingItems = await WatchlistItem.filter({ user_id: user.id, event_id: event.id });
      const existingItem = existingItems.length > 0 ? existingItems[0] : null;

      if (existingItem) {
        await WatchlistItem.delete(existingItem.id);
        newWatchlist.delete(event.id);
      } else {
        await WatchlistItem.create({
          user_id: user.id,
          event_id: event.id,
          itemType: 'event'
        });
        newWatchlist.add(event.id);
      }
      setWatchlist(newWatchlist);

      if (onNotificationAdd) {
        onNotificationAdd({
          id: Date.now(),
          type: 'watchlist_updated',
          message: language === 'ar' ?
            `${newWatchlist.has(event.id) ? 'تم إضافة' : 'تم إزالة'} ${event.title} ${newWatchlist.has(event.id) ? 'إلى' : 'من'} قائمة المتابعة` :
            `${event.title} ${newWatchlist.has(event.id) ? 'added to' : 'removed from'} watchlist`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      alert(language === 'ar' ? "فشل تحديث قائمة المتابعة. يرجى المحاولة مرة أخرى." : "Failed to update watchlist. Please try again.");
    }
  };

  const toggleDetailsExpansion = (eventId) => {
    const newExpanded = new Set(expandedDetails);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedDetails(newExpanded);
  };

  const formatEventTime = (eventTime) => {
    try {
      return formatInTimeZone(parseISO(eventTime), userTimezone, "MMM d, HH:mm", { locale: dateLocale });
    } catch {
      return format(parseISO(eventTime), "MMM d, HH:mm", { locale: dateLocale });
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6);

  const uniqueCategories = [...new Set(events.map(e => e.category))].filter(Boolean);
  
  const importanceLevels = [
    { label: t.high, value: 3 },
    { label: t.medium, value: 2 },
    { label: t.low, value: 1 },
  ];

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto fade-in">
        <div className="neumorphic p-6 lg:p-8 mb-8 rounded-3xl">
          <h3 className="text-2xl lg:text-3xl font-bold mb-2 service-title relative">
            <span className="absolute inset-0 bg-white/30 dark:bg-white/10 blur-lg rounded-lg -z-10"></span>
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

          <div className="flex flex-col gap-4">
            {/* Enhanced Search */}
            <div className="relative" ref={searchContainerRef}>
              <div className="flex-grow neumorphic-pressed p-3 rounded-xl flex items-center">
                <Search className="w-5 h-5 text-gray-500 mx-3" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    updateSearchSuggestions(e.target.value);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent outline-none text-primary placeholder-gray-500 py-2"
                  autoComplete="off"
                />
                {filters.search && (
                  <button
                    onClick={() => {
                      setFilters({ ...filters, search: "" });
                      setSuggestions([]);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isSearchFocused && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 neumorphic p-2 z-20 rounded-xl max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFilters({ ...filters, search: suggestion });
                        setIsSearchFocused(false);
                      }}
                      className="px-3 py-2 text-sm text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 items-center">
              {['all', 'today'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleDateFilter(filter)}
                  className={`neumorphic-button px-3 py-2.5 rounded-xl transition-all text-sm ${activeDateFilter === filter ? 'neumorphic-pressed' : ''}`}
                >
                  {t[filter]}
                </button>
              ))}

              {/* Week Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowWeekDropdown(!showWeekDropdown)}
                  className={`neumorphic-button px-3 py-2.5 rounded-xl transition-all text-sm w-full flex items-center justify-center gap-1 ${(activeDateFilter === 'thisWeek' || activeDateFilter === 'nextWeek') ? 'neumorphic-pressed' : ''}`}
                >
                  <span>{t.week}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showWeekDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showWeekDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 neumorphic p-1 rounded-xl z-10 fade-in">
                    <button
                      onClick={() => handleDateFilter('thisWeek')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {t.thisWeek}
                    </button>
                    <button
                      onClick={() => handleDateFilter('nextWeek')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {t.nextWeek}
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="neumorphic-button px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {filters.date && activeDateFilter === 'custom' ? 
                        format(filters.date, 'MMM d', { locale: dateLocale }) : 
                        t.selectDate
                      }
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 neumorphic" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(date) => handleDateFilter('custom', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Category Filter */}
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
            <div className="flex flex-wrap items-center gap-2">
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
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
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
        </div>

        {/* Events Display */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#7cb342', borderTopColor: 'transparent' }}></div>
              <p className="text-secondary">{t.loadingEvents}</p>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">{t.noEventsFound || "No Events Found"}</h3>
              <p className="text-secondary">{language === 'ar' ? 'لا توجد أحداث تطابق البحث' : 'No events match your search'}</p>
            </div>
          ) : (
            displayedEvents.map((event) => {
              const alertKey = event.id;
              const hasAlert = eventAlerts[alertKey];
              const isDetailsExpanded = expandedDetails.has(event.id);
              const isAnalyzing = analyzingRow === event.id;

              return (
                <div key={event.id}>
                  <div className="neumorphic-pressed p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center">
                      {/* Event Info */}
                      <div className="lg:col-span-7">
                        <div className="flex items-start gap-3 mb-3">
                          <ImportanceIndicator level={event.importance} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base lg:text-lg text-primary mb-1 line-clamp-2">
                              {highlightText(event.title, searchHighlight)}
                            </h4>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm text-secondary flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {formatEventTime(event.eventTime)}
                              </span>
                              <div className="neumorphic-inset px-2 py-1 rounded-lg flex items-center gap-2">
                                <CountryFlag countryCode={event.country} />
                                <span className="font-semibold text-xs" style={{ color: '#7cb342' }}>
                                  {highlightText(event.currency, searchHighlight)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Toggle */}
                      <div className="lg:col-span-2 flex justify-center">
                        <button
                          onClick={() => toggleDetailsExpansion(event.id)}
                          className="neumorphic-button p-2 lg:p-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                          title={isDetailsExpanded ? t.close : t.view}
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform ${isDetailsExpanded ? 'rotate-90' : ''}`} />
                          <span className="text-xs lg:text-sm font-medium hidden sm:inline">{t.view}</span>
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="lg:col-span-3 flex items-center justify-center lg:justify-end gap-2">
                        <button
                          onClick={() => toggleWatchlist(event)}
                          disabled={userLoading}
                          className="neumorphic-button p-2 lg:p-3 rounded-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!user ? (language === 'ar' ? "تسجيل الدخول لإضافة إلى قائمة المتابعة" : "Log in to add to watchlist") : (watchlist.has(event.id) ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'إضافة للمفضلة' : 'Add to favorites'))}
                        >
                          <Star className={`w-4 h-4 ${watchlist.has(event.id) ? 'fill-current' : ''}`} style={{ color: watchlist.has(event.id) ? '#7cb342' : '#9ca3af' }} />
                        </button>
                        <button
                          onClick={() => {
                            if (!user) { 
                              alert(language === 'ar' ? "يرجى تسجيل الدخول لتعيين التنبيهات." : "Please log in to set alerts."); 
                              return; 
                            }
                            setSelectedEvent(event);
                            setShowAlertModal(true);
                          }}
                          disabled={userLoading}
                          className="neumorphic-button p-2 lg:p-3 rounded-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!user ? (language === 'ar' ? "تسجيل الدخول لتعيين تنبيه" : "Log in to set an alert") : (language === 'ar' ? 'إعداد تنبيه' : 'Set Alert')}
                        >
                          <Bell className="w-4 h-4" style={{ color: hasAlert ? '#7cb342' : '#9ca3af' }} />
                        </button>
                        <button
                          onClick={() => handleAnalysis(event)}
                          disabled={isAnalyzing}
                          className="neumorphic-button p-2 lg:p-3 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                          title={language === 'ar' ? 'تحليل بالذكاء الاصطناعي' : 'AI Analysis'}
                        >
                          {isAnalyzing ? (
                            <div className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
                          ) : (
                            <Sparkles className="w-4 h-4" style={{ color: event.analysis ? '#8b5cf6' : '#9ca3af' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isDetailsExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 fade-in">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="neumorphic-inset p-2 rounded-lg text-center">
                            <p className="font-mono font-bold text-xs mb-0.5" style={{ color: '#22c55e' }}>
                              {event.actualValue || '−'}
                            </p>
                            <p className="text-[10px] text-muted uppercase tracking-wider">{t.actual}</p>
                          </div>
                          <div className="neumorphic-inset p-2 rounded-lg text-center">
                            <p className="font-mono font-bold text-xs mb-0.5" style={{ color: '#3b82f6' }}>
                              {event.forecast || '−'}
                            </p>
                            <p className="text-[10px] text-muted uppercase tracking-wider">{t.forecast}</p>
                          </div>
                          <div className="neumorphic-inset p-2 rounded-lg text-center">
                            <p className="font-mono font-bold text-xs mb-0.5 text-secondary">
                              {event.previous || '−'}
                            </p>
                            <p className="text-[10px] text-muted uppercase tracking-wider">{t.previous}</p>
                          </div>
                        </div>
                        
                        {event.description && (
                          <div className="neumorphic-inset p-3 rounded-lg">
                            <p className="text-sm text-secondary">{event.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Analysis Section */}
                  {expandedRow === event.id && (
                    <div className="neumorphic-inset p-4 mt-2 rounded-2xl fade-in">
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2 text-secondary py-8">
                          <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
                          {t.analyzing}
                        </div>
                      ) : event.analysis ? (
                        <div className="text-primary whitespace-pre-wrap leading-relaxed text-sm">
                          {event.analysis}
                        </div>
                      ) : (
                        <div className="text-center text-secondary py-8">
                          {language === 'ar' ? 'التحليل غير متوفر. انقر على أيقونة التحليل لإنشائه.' : 'Analysis not available. Click the analysis icon to generate.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Show More/Less Button */}
          {filteredEvents.length > 6 && (
            <div className="text-center mt-6">
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

      <NewsAlertModal
        event={selectedEvent}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSetAlert={handleSetAlert}
        existingAlerts={eventAlerts}
      />
    </div>
  );
}

export default function EconomicCalendarTable({ onNotificationAdd }) {
  return <CalendarTable onNotificationAdd={onNotificationAdd} />;
}