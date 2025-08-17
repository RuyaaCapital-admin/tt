
import React, { useState, useEffect } from "react";
import { Alert } from "@/api/entities";
import { User } from "@/api/entities"; // Keep User import just in case other parts of the app might use it, though not directly used in the new auth flow here.
import { Asset } from "@/api/entities";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { useTheme } from "./ui/Theme";

export default function AlertsSystem({ onNotificationAdd }) {
    const { language, t } = useTheme();
    const [alerts, setAlerts] = useState([]);
    const [assets, setAssets] = useState([]);
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAllAlerts, setShowAllAlerts] = useState(false);
    const [newAlert, setNewAlert] = useState({
        asset_id: "",
        targetPrice: "",
        alertType: "crossesAbove"
    });
    const [pairSuggestions, setPairSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const loadData = async () => {
        try {
            setUserLoading(true);
            
            // Get user from localStorage (our custom auth)
            const savedSession = localStorage.getItem('liirat-user-session');
            let currentUser = null;
            
            if (savedSession) {
                try {
                    currentUser = JSON.parse(savedSession);
                    console.log('Loaded user from session:', currentUser);
                    
                    if (currentUser && currentUser.id && currentUser.email) {
                        setUser(currentUser);
                    } else {
                        console.log('Invalid user session data');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error parsing user session:", error);
                    setUser(null);
                }
            } else {
                console.log('No user session found');
                setUser(null);
            }
            
            setUserLoading(false);
            
            // Load user alerts if authenticated
            if (currentUser && currentUser.id) {
                try {
                    console.log('Loading alerts for user:', currentUser.id);
                    const userAlerts = await Alert.filter({ user_id: currentUser.id });
                    console.log('Found user alerts:', userAlerts.length);
                    setAlerts(userAlerts);
                } catch (error) {
                    console.error("Error loading user alerts:", error);
                    setAlerts([]);
                }
            } else {
                setAlerts([]);
            }
            
            // Load assets for everyone
            try {
                const allAssets = await Asset.list();
                setAssets(allAssets);
            } catch (error) {
                console.error("Error loading assets:", error);
                setAssets([]);
            }
            
        } catch (error) {
            console.error("Error loading data:", error);
            setAlerts([]);
            setAssets([]);
            setUser(null);
            setUserLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        
        // Listen for auth changes
        const handleAuthChange = () => {
            console.log('Auth changed, reloading data');
            loadData();
        };
        
        window.addEventListener('auth-changed', handleAuthChange);
        return () => window.removeEventListener('auth-changed', handleAuthChange);
    }, []);

    const handlePairInput = (value) => {
        setNewAlert({...newAlert, asset_id: value});
        if (value.length > 0) {
            const filtered = assets.filter(asset =>
                asset.symbol.toLowerCase().includes(value.toLowerCase()) ||
                asset.name.toLowerCase().includes(value.toLowerCase())
            );
            setPairSuggestions(filtered.slice(0, 8));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSelectedAsset(null);
        }
    };

    const selectPair = (asset) => {
        setNewAlert({...newAlert, asset_id: asset.id});
        setSelectedAsset(asset);
        setShowSuggestions(false);
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please log in to create an alert.");
            return;
        }
        
        try {
            console.log('Creating alert for user:', user.id);
            console.log('Alert data:', {
                user_id: user.id,
                asset_id: newAlert.asset_id,
                targetPrice: parseFloat(newAlert.targetPrice),
                alertType: newAlert.alertType
            });
            
            const createdAlert = await Alert.create({
                user_id: user.id,
                asset_id: newAlert.asset_id,
                targetPrice: parseFloat(newAlert.targetPrice),
                alertType: newAlert.alertType,
                isActive: true
            });
            
            console.log('Alert created successfully:', createdAlert);
            
            if (onNotificationAdd) {
                onNotificationAdd({
                    id: Date.now(),
                    type: 'alert_set',
                    message: `${t.alertSet} for ${selectedAsset?.symbol} at ${newAlert.targetPrice}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Reset form
            setNewAlert({ asset_id: "", targetPrice: "", alertType: "crossesAbove" });
            setSelectedAsset(null);
            setShowForm(false);
            
            // Reload data to show new alert
            loadData();
        } catch (error) {
            console.error("Error creating alert:", error);
            alert("Failed to create alert. Please try again.");
        }
    };

    const deleteAlert = async (alertId) => {
        if (!user) return;
        try {
            await Alert.delete(alertId);
            loadData();
        } catch (error) {
            console.error("Error deleting alert:", error);
        }
    };
    
    const getAssetName = (assetId) => assets.find(a => a.id === assetId)?.symbol || '...';
    
    const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 5);

    return (
        <div className="px-4 py-8 bg-light-bg dark:bg-dark-bg" id="alerts-system-card">
            <div className="max-w-4xl mx-auto">
                <div className="neumorphic p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-bold mb-2 service-title relative">
                                <span className="absolute inset-0 bg-white/30 dark:bg-white/10 blur-lg rounded-lg -z-10"></span>
                                {t.alertsTitle}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">{t.alertsDescription}</p>
                        </div>
                        <button
                            onClick={() => {
                                if(!user) { 
                                    alert("Please log in to add alerts."); 
                                    return; 
                                }
                                setShowForm(!showForm);
                            }}
                            disabled={userLoading || !user}
                            className="neumorphic-button px-6 py-3 flex items-center gap-2 font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: 'var(--light-accent)' }}
                        >
                            <Plus className="w-5 h-5" />
                            {t.addAlert}
                        </button>
                    </div>

                    {/* Show loading state */}
                    {userLoading && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#7cb342', borderTopColor: 'transparent' }}></div>
                            <p className="text-secondary">Loading...</p>
                        </div>
                    )}

                    {/* Show login prompt if not authenticated */}
                    {!userLoading && !user && (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50 text-secondary" />
                            <h4 className="text-xl font-semibold text-primary mb-2">Login Required</h4>
                            <p className="text-secondary mb-6">Please log in to create and manage your alerts</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                                className="neumorphic-button px-6 py-3 text-white font-semibold rounded-xl"
                                style={{ backgroundColor: '#7cb342' }}
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    {/* Show form and alerts only if user is authenticated */}
                    {!userLoading && user && (
                        <>
                            {showForm && (
                                <div className="neumorphic-pressed p-6 mb-8 rounded-2xl">
                                    <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.addAlert}</h4>
                                    <form onSubmit={handleCreateAlert} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.currencyPair}</label>
                                                <input
                                                    type="text"
                                                    value={selectedAsset ? selectedAsset.symbol : newAlert.asset_id}
                                                    onChange={(e) => handlePairInput(e.target.value)}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    placeholder={t.searchPairs}
                                                    className="w-full neumorphic-pressed p-3 rounded-xl outline-none text-gray-800 dark:text-gray-200 bg-transparent"
                                                    required
                                                />
                                                {showSuggestions && pairSuggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 z-10 neumorphic mt-1 rounded-xl max-h-48 overflow-y-auto">
                                                        {pairSuggestions.map((asset, index) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => selectPair(asset)}
                                                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 first:rounded-t-xl last:rounded-b-xl"
                                                            >
                                                                <div className="font-medium">{asset.symbol} ({asset.name})</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.alertType}</label>
                                                <select
                                                    value={newAlert.alertType}
                                                    onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value })}
                                                    className="w-full neumorphic-pressed p-3 rounded-xl outline-none text-gray-800 dark:text-gray-200 bg-transparent"
                                                >
                                                    <option value="crossesAbove">{t.crosses_above}</option>
                                                    <option value="crossesBelow">{t.crosses_below}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {selectedAsset && (
                                            <div className="neumorphic-inset p-4 rounded-xl mt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.currentPrice}:</span>
                                                    <span className="font-bold text-lg" style={{ color: '#7cb342' }}>
                                                        {selectedAsset.latestPrice?.toFixed(4) || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.targetPrice}</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={newAlert.targetPrice}
                                                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                                                    placeholder="1.0800"
                                                    className="w-full neumorphic-pressed p-3 pl-10 rounded-xl outline-none text-gray-800 dark:text-gray-200 bg-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                className="neumorphic-button px-6 py-3 font-semibold rounded-xl transition-all hover:scale-105"
                                                style={{ backgroundColor: '#7cb342', color: 'white' }}
                                            >
                                                {t.save}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="neumorphic-button px-6 py-3 text-gray-600 dark:text-gray-400 font-semibold rounded-xl"
                                            >
                                                {t.cancel}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t.activeAlerts} ({alerts.length})</h4>
                                {alerts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>{t.noAlerts}</p>
                                    </div>
                                ) : (
                                    <>
                                        {displayedAlerts.map(alert => (
                                            <div key={alert.id} className="neumorphic-pressed p-4 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${alert.alertType === 'crossesAbove' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                                        {alert.alertType === 'crossesAbove' ?
                                                            <TrendingUp className="w-5 h-5 text-green-600" /> :
                                                            <TrendingDown className="w-5 h-5 text-red-600" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                            {getAssetName(alert.asset_id)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {alert.alertType === 'crossesAbove' ? t.crosses_above : t.crosses_below} {alert.targetPrice}
                                                        </p>
                                                        {!alert.isActive && (
                                                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-lg">
                                                                Triggered
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteAlert(alert.id)}
                                                    className="neumorphic-button p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {alerts.length > 5 && (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                                                    className="neumorphic-button px-4 py-2 flex items-center gap-2 mx-auto rounded-xl"
                                                    style={{ color: '#7cb342' }}
                                                >
                                                    {showAllAlerts ? (
                                                        <><ChevronUp className="w-4 h-4" />{t.showLess}</>
                                                    ) : (
                                                        <><ChevronDown className="w-4 h-4" />{t.showMore} ({alerts.length - 5})</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
