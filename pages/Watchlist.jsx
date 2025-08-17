import React, { useState, useEffect } from "react";
import { Star, TrendingUp, TrendingDown, Calendar, Bell, Trash2, Plus, Search, RefreshCw } from "lucide-react";
import { useTheme } from "../components/ui/Theme";
import { WatchlistItem } from "@/api/entities";
import { Event } from "@/api/entities";
import { Asset } from "@/api/entities";
import { Alert } from "@/api/entities";
import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import ProtectedRoute from "../components/ProtectedRoute";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse neumorphic-pressed p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const WatchlistItemCard = ({ item, onRemove, onSetAlert, language, dateLocale }) => {
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItemData();
  }, [item]);

  const loadItemData = async () => {
    try {
      setLoading(true);
      if (item.itemType === 'event' && item.event_id) {
        const events = await Event.filter({ id: item.event_id });
        if (events.length > 0) {
          setItemData(events[0]);
        }
      } else if (item.itemType === 'asset' && item.asset_id) {
        const assets = await Asset.filter({ id: item.asset_id });
        if (assets.length > 0) {
          setItemData(assets[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load item data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse neumorphic-pressed p-4 rounded-xl">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (!itemData) {
    return (
      <div className="neumorphic-pressed p-4 rounded-xl opacity-50">
        <p className="text-secondary">
          {language === 'ar' ? 'العنصر غير متوفر' : 'Item not available'}
        </p>
      </div>
    );
  }

  return (
    <div className="neumorphic-pressed p-4 rounded-xl hover:scale-[1.02] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {item.itemType === 'event' ? (
                <Calendar className="w-4 h-4 text-blue-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              <span className="text-xs font-medium px-2 py-1 rounded-lg neumorphic-inset">
                {item.itemType === 'event' ? (language === 'ar' ? 'حدث' : 'Event') : (language === 'ar' ? 'أصل' : 'Asset')}
              </span>
            </div>
          </div>
          
          <h4 className="font-bold text-primary mb-1 line-clamp-2">
            {itemData.title || itemData.name || itemData.symbol}
          </h4>
          
          {item.itemType === 'event' && itemData.eventTime && (
            <p className="text-xs text-secondary">
              {format(parseISO(itemData.eventTime), "PPp", { locale: dateLocale })}
            </p>
          )}
          
          {item.itemType === 'event' && itemData.currency && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-1 rounded-lg neumorphic-inset" style={{ color: '#7cb342' }}>
                {itemData.currency}
              </span>
              {itemData.importance && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: level <= itemData.importance ? 
                          (itemData.importance === 3 ? '#ef4444' : itemData.importance === 2 ? '#f59e0b' : '#6b7280') : 
                          '#d1d5db'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {item.itemType === 'asset' && itemData.current_price && (
            <p className="text-sm font-medium text-primary">
              ${itemData.current_price}
              {itemData.price_change && (
                <span className={`ml-2 text-xs ${itemData.price_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {itemData.price_change > 0 ? '+' : ''}{itemData.price_change}%
                </span>
              )}
            </p>
          )}
          
          {item.addedAt && (
            <p className="text-xs text-secondary mt-1">
              {language === 'ar' ? 'أُضيف في' : 'Added'} {format(parseISO(item.addedAt), "PPp", { locale: dateLocale })}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onSetAlert(item)}
            className="neumorphic-button p-2 rounded-xl transition-all hover:scale-110"
            title={language === 'ar' ? 'إعداد تنبيه' : 'Set Alert'}
          >
            <Bell className="w-4 h-4" style={{ color: '#7cb342' }} />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="neumorphic-button p-2 rounded-xl transition-all hover:scale-110 text-red-500"
            title={language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function WatchlistContent() {
  const { language, t } = useTheme();
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      // Get user from localStorage
      const savedSession = localStorage.getItem('liirat-user-session');
      if (!savedSession) {
        setUser(null);
        setWatchlistItems([]);
        return;
      }

      const currentUser = JSON.parse(savedSession);
      if (!currentUser || !currentUser.id) {
        setUser(null);
        setWatchlistItems([]);
        return;
      }

      setUser(currentUser);
      console.log('Loading watchlist for user:', currentUser.id);

      // Load user's watchlist items
      const items = await WatchlistItem.filter({ user_id: currentUser.id });
      console.log('Loaded watchlist items:', items);
      setWatchlistItems(items);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      setWatchlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد إزالة هذا العنصر من المفضلة؟' : 'Remove this item from your watchlist?')) {
      return;
    }

    try {
      await WatchlistItem.delete(itemId);
      setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert(language === 'ar' ? 'فشل في إزالة العنصر' : 'Failed to remove item');
    }
  };

  const handleSetAlert = async (watchlistItem) => {
    if (!user) return;

    try {
      // Create an alert for this item
      const alertData = {
        user_id: user.id,
        isActive: true
      };

      if (watchlistItem.itemType === 'event') {
        alertData.event_id = watchlistItem.event_id;
        alertData.alertType = 'onRelease';
      } else if (watchlistItem.itemType === 'asset') {
        alertData.asset_id = watchlistItem.asset_id;
        alertData.alertType = 'crossesAbove';
        alertData.targetPrice = 0; // User would need to set this
      }

      await Alert.create(alertData);
      alert(language === 'ar' ? 'تم إنشاء التنبيه بنجاح' : 'Alert created successfully');
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert(language === 'ar' ? 'فشل في إنشاء التنبيه' : 'Failed to create alert');
    }
  };

  // Filter watchlist items
  const filteredItems = watchlistItems.filter(item => {
    const typeMatch = filterType === 'all' || item.itemType === filterType;
    // For search, we'd need to load the actual item data, which is complex
    // For now, just filter by type
    return typeMatch;
  });

  const eventItems = filteredItems.filter(item => item.itemType === 'event');
  const assetItems = filteredItems.filter(item => item.itemType === 'asset');

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-8 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold service-title mb-4">
            <Star className="w-8 h-8 inline-block mr-2 mb-1" style={{ color: '#7cb342' }} />
            {language === 'ar' ? 'قائمة المتابعة' : 'My Watchlist'}
          </h1>
          <p className="text-secondary max-w-2xl mx-auto">
            {language === 'ar' ? 
              'تتبع الأحداث الاقتصادية والأصول المالية المهمة بالنسبة لك' : 
              'Track important economic events and financial assets that matter to you'}
          </p>
        </div>

        {/* Controls */}
        <div className="neumorphic p-6 rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="neumorphic-pressed p-3 rounded-xl flex items-center flex-1 md:flex-initial md:w-64">
                <Search className="w-5 h-5 text-gray-500 mx-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'ar' ? 'البحث في المفضلة...' : 'Search watchlist...'}
                  className="w-full bg-transparent outline-none text-primary placeholder-gray-500 py-2"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="neumorphic-pressed px-4 py-3 rounded-xl outline-none bg-transparent text-primary"
              >
                <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                <option value="event">{language === 'ar' ? 'الأحداث' : 'Events'}</option>
                <option value="asset">{language === 'ar' ? 'الأصول' : 'Assets'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">
                {filteredItems.length} {language === 'ar' ? 'عنصر' : 'items'}
              </span>
              <button
                onClick={loadWatchlist}
                disabled={loading}
                className="neumorphic-button px-4 py-2 flex items-center gap-2 font-medium disabled:opacity-50 rounded-xl text-sm"
                style={{ color: '#7cb342' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث' : 'Refresh')}</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : !user ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              {language === 'ar' ? 'قم بتسجيل الدخول' : 'Sign In Required'}
            </h3>
            <p className="text-secondary">
              {language === 'ar' ? 'يرجى تسجيل الدخول لعرض قائمة المتابعة الخاصة بك' : 'Please sign in to view your watchlist'}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              {language === 'ar' ? 'قائمة المتابعة فارغة' : 'Your Watchlist is Empty'}
            </h3>
            <p className="text-secondary mb-6">
              {language === 'ar' ? 
                'ابدأ بإضافة الأحداث والأصول التي تهمك لتتبعها هنا' : 
                'Start adding events and assets you care about to track them here'}
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/EconomicCalendar"
                className="neumorphic-button px-6 py-3 font-semibold rounded-xl transition-all hover:scale-105"
                style={{ color: '#7cb342' }}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                {language === 'ar' ? 'تصفح الأحداث' : 'Browse Events'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Events Section */}
            {eventItems.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: '#7cb342' }} />
                  {language === 'ar' ? 'الأحداث الاقتصادية' : 'Economic Events'} ({eventItems.length})
                </h2>
                <div className="space-y-3">
                  {eventItems.map((item) => (
                    <WatchlistItemCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onSetAlert={handleSetAlert}
                      language={language}
                      dateLocale={dateLocale}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assets Section */}
            {assetItems.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#7cb342' }} />
                  {language === 'ar' ? 'الأصول المالية' : 'Financial Assets'} ({assetItems.length})
                </h2>
                <div className="space-y-3">
                  {assetItems.map((item) => (
                    <WatchlistItemCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onSetAlert={handleSetAlert}
                      language={language}
                      dateLocale={dateLocale}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Watchlist() {
  return (
    <ProtectedRoute>
      <WatchlistContent />
    </ProtectedRoute>
  );
}