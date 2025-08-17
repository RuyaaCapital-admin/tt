
import React, { useState, useEffect } from "react";
import { User as UserIcon, Bell, Settings as SettingsIcon, HelpCircle, Edit3, Camera, Check, X, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../components/ui/Theme";
import { useAuth } from "../components/useAuth";
import { Alert } from "@/api/entities";
import { Asset } from "@/api/entities";
import { WatchlistItem } from "@/api/entities";
import { UserProfile } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";
import ProtectedRoute from "../components/ProtectedRoute";

const TabButton = ({ isActive, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`neumorphic-button w-full p-3 flex items-center gap-3 text-left transition-all rounded-xl ${
      isActive ? 'neumorphic-pressed' : ''
    }`}
  >
    <div className="flex-1 flex items-center gap-3">
      {children}
    </div>
    {count !== undefined && (
      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
        {count}
      </span>
    )}
  </button>
);

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse neumorphic-pressed p-4 rounded-xl">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const CreateAlertModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const { language } = useTheme();
  const [alertData, setAlertData] = useState({
    symbol: '',
    target: '',
    condition: 'above'
  });
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const allAssets = await Asset.list();
        setAssets(allAssets);
        setFilteredAssets(allAssets.slice(0, 10));
      } catch (error) {
        console.error('Failed to load assets:', error);
      }
    };
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const handleSymbolChange = (value) => {
    setAlertData(prev => ({ ...prev, symbol: value }));
    if (value) {
      const filtered = assets.filter(asset =>
        asset.symbol.toLowerCase().includes(value.toLowerCase()) ||
        asset.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAssets(filtered.slice(0, 10));
    } else {
      setFilteredAssets(assets.slice(0, 10));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedAsset = assets.find(a => a.symbol === alertData.symbol);
    if (!selectedAsset) {
      alert('Please select a valid asset');
      return;
    }
    onSubmit({
      ...alertData,
      asset_id: selectedAsset.id
    });
    setAlertData({ symbol: '', target: '', condition: 'above' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="neumorphic max-w-md w-full p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary">
            {language === 'ar' ? 'إنشاء تنبيه' : 'Create Alert'}
          </h3>
          <button onClick={onClose} className="neumorphic-button p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {language === 'ar' ? 'الرمز' : 'Symbol'}
            </label>
            <input
              type="text"
              value={alertData.symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              placeholder="EURUSD, BTCUSD, etc."
              className="neumorphic-pressed w-full p-3 rounded-xl outline-none bg-transparent text-primary"
              list="assets-list"
              required
            />
            <datalist id="assets-list">
              {filteredAssets.map(asset => (
                <option key={asset.id} value={asset.symbol}>{asset.name}</option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {language === 'ar' ? 'السعر المستهدف' : 'Target Price'}
            </label>
            <input
              type="number"
              step="0.00001"
              value={alertData.target}
              onChange={(e) => setAlertData(prev => ({ ...prev, target: e.target.value }))}
              placeholder="1.0850"
              className="neumorphic-pressed w-full p-3 rounded-xl outline-none bg-transparent text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {language === 'ar' ? 'الحالة' : 'Condition'}
            </label>
            <select
              value={alertData.condition}
              onChange={(e) => setAlertData(prev => ({ ...prev, condition: e.target.value }))}
              className="neumorphic-pressed w-full p-3 rounded-xl outline-none bg-transparent text-primary"
            >
              <option value="above">{language === 'ar' ? 'أعلى من' : 'Above'}</option>
              <option value="below">{language === 'ar' ? 'أقل من' : 'Below'}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 neumorphic-button px-4 py-3 font-semibold rounded-xl text-white disabled:opacity-50"
              style={{ backgroundColor: '#7cb342' }}
            >
              {isSubmitting ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (language === 'ar' ? 'إنشاء' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 neumorphic-button px-4 py-3 text-secondary font-semibold rounded-xl"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AccountContent() {
  const { language, theme, toggleTheme, toggleLanguage, t } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Initialize profileData when user loads from auth context
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.full_name || user.name || '' });
      loadAssets();
    }
  }, [user]);

  useEffect(() => {
    // Load data when tab changes and user is available
    if (user) {
      if (activeTab === 'alerts') {
        loadAlerts();
      } else if (activeTab === 'watchlist') {
        loadWatchlist();
      }
    }
  }, [activeTab, user]);

  // Listen for auth changes to reload data
  useEffect(() => {
    const handleAuthChange = () => {
      if (activeTab === 'alerts') {
        loadAlerts();
      } else if (activeTab === 'watchlist') {
        loadWatchlist();
      }
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, [activeTab]);

  const loadAssets = async () => {
    try {
      const allAssets = await Asset.list();
      setAssets(allAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const loadAlerts = async () => {
    if (!user) return;
    setLoadingAlerts(true);
    try {
      const userAlerts = await Alert.filter({ user_id: user.id });
      setAlerts(userAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const loadWatchlist = async () => {
    if (!user) return;
    setLoadingWatchlist(true);
    try {
      const userWatchlist = await WatchlistItem.filter({ user_id: user.id });
      setWatchlistItems(userWatchlist);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      setWatchlistItems([]);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleCreateAlert = async (alertData) => {
    setSubmittingAlert(true);
    try {
      await Alert.create({
        user_id: user.id,
        asset_id: alertData.asset_id,
        targetPrice: parseFloat(alertData.target),
        alertType: alertData.condition === 'above' ? 'crossesAbove' : 'crossesBelow',
        isActive: true
      });
      setShowCreateAlert(false);
      // Reload alerts after creation
      loadAlerts();
      // Trigger auth-changed event to update other components
      window.dispatchEvent(new Event('auth-changed'));
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert(language === 'ar' ? 'فشل في إنشاء التنبيه' : 'Failed to create alert');
    } finally {
      setSubmittingAlert(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) return;
    setUpdatingProfile(true);
    try {
      // Update in UserProfile table
      const userProfiles = await UserProfile.filter({ user_email: user.email });
      if (userProfiles.length > 0) {
        await UserProfile.update(userProfiles[0].id, {
          full_name: profileData.name.trim()
        });
        
        // Update auth context
        await updateProfile({ full_name: profileData.name.trim() });
        setEditingProfile(false);
        
        // Trigger reload of user session
        window.dispatchEvent(new Event('auth-changed'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(language === 'ar' ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const toggleAlert = async (alertId, currentActive) => {
    try {
      await Alert.update(alertId, { isActive: !currentActive });
      loadAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const deleteAlert = async (alertId) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد حذف هذا التنبيه؟' : 'Delete this alert?')) return;
    try {
      await Alert.delete(alertId);
      loadAlerts();
      // Update other components
      window.dispatchEvent(new Event('auth-changed'));
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const removeWatchlistItem = async (itemId) => {
    try {
      await WatchlistItem.delete(itemId);
      loadWatchlist();
    } catch (error) {
      console.error('Failed to remove watchlist item:', error);
    }
  };

  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? `${asset.symbol} (${asset.name})` : assetId;
  };

  const tabs = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: UserIcon },
    { id: 'alerts', label: language === 'ar' ? 'التنبيهات' : 'Alerts', icon: Bell, count: alerts.filter(a => a.isActive).length },
    { id: 'watchlist', label: language === 'ar' ? 'قائمة المتابعة' : 'Watchlist', icon: Trash2, count: watchlistItems.length },
    { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: SettingsIcon },
    { id: 'support', label: language === 'ar' ? 'الدعم' : 'Support', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-8 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 service-title">{language === 'ar' ? 'ملف المستخدم' : 'My Account'}</h1>
          <p className="text-secondary">{language === 'ar' ? 'إدارة ملفك الشخصي وإعداداتك' : 'Manage your profile and preferences'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                count={tab.count}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </TabButton>
            ))}
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="neumorphic p-6 rounded-2xl min-h-[400px]">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && user && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 neumorphic-raised rounded-full flex items-center justify-center">
                      <UserIcon className="w-12 h-12" style={{ color: '#7cb342' }} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      {editingProfile ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="neumorphic-pressed px-3 py-2 rounded-xl outline-none bg-transparent text-primary flex-1"
                            placeholder={language === 'ar' ? 'الاسم' : 'Name'}
                          />
                          <button
                            onClick={handleUpdateProfile}
                            disabled={updatingProfile}
                            className="neumorphic-button p-2 rounded-xl text-green-600 disabled:opacity-50"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProfile(false);
                              setProfileData({ name: user.full_name || user.name || '' });
                            }}
                            className="neumorphic-button p-2 rounded-xl text-red-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <h2 className="text-2xl font-bold text-primary">{user.full_name || user.name || user.email}</h2>
                          <button
                            onClick={() => setEditingProfile(true)}
                            className="neumorphic-button p-2 rounded-xl"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <p className="text-secondary mt-1">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-primary">{alerts.filter(a => a.isActive).length}</div>
                      <div className="text-sm text-secondary">{language === 'ar' ? 'تنبيهات نشطة' : 'Active Alerts'}</div>
                    </div>
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-primary">{watchlistItems.length}</div>
                      <div className="text-sm text-secondary">{language === 'ar' ? 'قائمة المتابعة' : 'Watchlist'}</div>
                    </div>
                    <div className="neumorphic-inset p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold" style={{ color: '#7cb342' }}>✓</div>
                      <div className="text-sm text-secondary">{language === 'ar' ? 'حساب مفعل' : 'Verified'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-primary">
                      {language === 'ar' ? 'التنبيهات' : 'Price Alerts'}
                    </h3>
                    <button
                      onClick={() => setShowCreateAlert(true)}
                      className="neumorphic-button px-4 py-2 flex items-center gap-2 text-white font-medium rounded-xl"
                      style={{ backgroundColor: '#7cb342' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'إنشاء تنبيه' : 'Create Alert'}</span>
                    </button>
                  </div>

                  {loadingAlerts ? (
                    <LoadingSkeleton />
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-12 text-secondary">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="neumorphic-pressed p-4 rounded-xl flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-primary">{getAssetName(alert.asset_id)}</div>
                            <div className="text-sm text-secondary">
                              {language === 'ar' ? (
                                alert.alertType === 'crossesAbove' ? `أعلى من ${alert.targetPrice}` :
                                `أقل من ${alert.targetPrice}`
                              ) : (
                                `${alert.alertType === 'crossesAbove' ? 'Above' : 'Below'} ${alert.targetPrice}`
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleAlert(alert.id, alert.isActive)}
                              className={`w-12 h-6 rounded-full transition-all ${alert.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${alert.isActive ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : (language === 'ar' ? '-translate-x-0.5' : 'translate-x-0.5')}`}></div>
                            </button>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="neumorphic-button p-2 rounded-xl text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Watchlist Tab */}
              {activeTab === 'watchlist' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary">
                    {language === 'ar' ? 'قائمة المتابعة' : 'Watchlist'}
                  </h3>

                  {loadingWatchlist ? (
                    <LoadingSkeleton />
                  ) : watchlistItems.length === 0 ? (
                    <div className="text-center py-12 text-secondary">
                      <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{language === 'ar' ? 'قائمة المتابعة فارغة' : 'No watchlist items yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {watchlistItems.map((item) => (
                        <div key={item.id} className="neumorphic-pressed p-4 rounded-xl flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-primary">
                              {item.itemType === 'event' ? 
                                (language === 'ar' ? 'حدث اقتصادي' : 'Economic Event') : 
                                getAssetName(item.asset_id || item.event_id)
                              }
                            </div>
                            <div className="text-sm text-secondary">
                              {language === 'ar' ? 'تمت الإضافة' : 'Added'}: {format(parseISO(item.addedAt || item.created_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <button
                            onClick={() => removeWatchlistItem(item.id)}
                            className="neumorphic-button p-2 rounded-xl text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary">{language === 'ar' ? 'الإعدادات' : 'Settings'}</h3>
                  
                  <div className="space-y-4">
                    <div className="neumorphic-inset p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">{language === 'ar' ? 'اللغة' : 'Language'}</h4>
                          <p className="text-sm text-secondary">{language === 'ar' ? 'تغيير لغة التطبيق' : 'Change app language'}</p>
                        </div>
                        <button
                          onClick={toggleLanguage}
                          className="neumorphic-button px-4 py-2 rounded-xl font-medium"
                        >
                          {language === 'ar' ? 'English' : 'العربية'}
                        </button>
                      </div>
                    </div>

                    <div className="neumorphic-inset p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">{language === 'ar' ? 'المظهر' : 'Theme'}</h4>
                          <p className="text-sm text-secondary">{language === 'ar' ? 'تبديل بين الفاتح والداكن' : 'Switch between light and dark'}</p>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="neumorphic-button px-4 py-2 rounded-xl font-medium"
                        >
                          {theme === 'light' ? (language === 'ar' ? 'داكن' : 'Dark') : (language === 'ar' ? 'فاتح' : 'Light')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Tab */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary">{language === 'ar' ? 'الدعم' : 'Support'}</h3>
                  
                  <div className="space-y-4">
                    <div className="neumorphic-inset p-4 rounded-xl">
                      <h4 className="font-semibold text-primary mb-2">{language === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h4>
                      <p className="text-secondary text-sm mb-3">
                        {language === 'ar' ? 'لأي استفسارات أو مشاكل تقنية' : 'For any questions or technical issues'}
                      </p>
                      <div className="text-secondary space-y-2">
                        <p className="flex items-center gap-2">
                          <span>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                          <a href="mailto:sales@liirat.com" className="text-blue-500 hover:underline">sales@liirat.com</a>
                        </p>
                        <p className="flex items-center gap-2">
                          <span>{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                          <a href="tel:+96171638452" className="text-blue-500 hover:underline">+96171638452</a>
                        </p>
                      </div>
                    </div>

                    <div className="neumorphic-inset p-4 rounded-xl">
                      <h4 className="font-semibold text-primary mb-2">{language === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h4>
                      <div className="text-sm text-secondary space-y-1">
                        <p>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} {user?.email}</p>
                        <p>{language === 'ar' ? 'تاريخ الإنشاء:' : 'Member since:'} {user?.created_date ? format(parseISO(user.created_date), 'MMM d, yyyy') : 'N/A'}</p>
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full neumorphic-button p-3 font-semibold text-red-600 rounded-xl"
                    >
                      {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateAlertModal
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        onSubmit={handleCreateAlert}
        isSubmitting={submittingAlert}
      />
    </div>
  );
}

export default function Account() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
