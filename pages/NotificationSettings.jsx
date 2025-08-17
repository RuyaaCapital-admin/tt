import React, { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Settings } from "lucide-react";
import { useTheme } from "../components/ui/Theme";
import { User } from "@/api/entities";

export default function NotificationSettings() {
    const { language, t } = useTheme();
    const [settings, setSettings] = useState({
        email: true,
        push: true,
        whatsapp: false,
        highImportanceOnly: false,
        preferredCurrencies: ['USD', 'EUR'],
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserSettings = async () => {
            setLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser && currentUser.notificationPreferences) {
                    setSettings(currentUser.notificationPreferences);
                }
            } catch (error) {
                console.error("Failed to load user settings", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUserSettings();
    }, []);

    const handleSave = async () => {
        if (!user) {
            alert("Please log in to save settings.");
            return;
        }
        try {
            await User.updateMyUserData({ notificationPreferences: settings });
            
            const button = document.querySelector('.save-button');
            if (button) {
                const originalText = button.textContent;
                button.textContent = t.settingsSaved;
                button.style.backgroundColor = '#22c55e';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '#7cb342';
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Error saving settings.");
        }
    };
    
    if (loading) {
         return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#7cb342', borderTopColor: 'transparent' }}></div></div>
    }
    
    if (!user) {
        return (
             <div className="max-w-4xl mx-auto text-center py-16">
                 <h1 className="text-2xl font-bold">Please Log In</h1>
                 <p className="text-secondary mt-2">Log in to manage your notification settings.</p>
            </div>
        )
    }

    return (
        <div className="px-4 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto fade-in">
                <div className="neumorphic p-8 mb-8 rounded-3xl">
                    <h1 className="text-3xl font-bold mb-2 service-title flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        {t.notifSettingsTitle}
                    </h1>
                    <p className="text-secondary">{t.notifSettingsDescription}</p>
                </div>

                <div className="space-y-6">
                    <div className="neumorphic p-6 rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Notification Channels</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer neumorphic-inset p-3 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.checked })}
                                    className="w-5 h-5" />
                                <Mail className="w-5 h-5 text-blue-500" />
                                <span className="text-primary">{t.emailNotifications}</span>
                            </label>
                             <label className="flex items-center gap-3 cursor-pointer neumorphic-inset p-3 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={settings.push}
                                    onChange={(e) => setSettings({ ...settings, push: e.target.checked })}
                                    className="w-5 h-5" />
                                <Smartphone className="w-5 h-5 text-green-500" />
                                <span className="text-primary">{t.pushNotifications}</span>
                            </label>
                        </div>
                    </div>

                    <div className="neumorphic p-6 rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 text-primary">General Preferences</h3>
                        <label className="flex items-center gap-3 cursor-pointer neumorphic-inset p-3 rounded-lg">
                           <input
                                type="checkbox"
                                checked={settings.highImportanceOnly}
                                onChange={(e) => setSettings({ ...settings, highImportanceOnly: e.target.checked })}
                                className="w-5 h-5" />
                            <Bell className="w-5 h-5 text-red-500" />
                            <span className="text-primary">{t.highImportanceOnly}</span>
                        </label>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleSave}
                            className="save-button neumorphic-button px-8 py-4 font-semibold rounded-2xl transition-all hover:scale-105"
                            style={{ backgroundColor: '#7cb342', color: 'white' }}>
                            {t.saveSettings}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}