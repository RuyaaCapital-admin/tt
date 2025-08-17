import React, { useState, useEffect } from "react";
import { Bell, Trash2, CheckCircle } from "lucide-react";
import { useTheme } from "../components/ui/Theme";
import { Notification } from "@/api/entities";
import { User } from "@/api/entities";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function NotificationHistory() {
    const { language, t } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const dateLocale = language === 'ar' ? ar : enUS;

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            if (currentUser) {
                const userNotifications = await Notification.filter({ user_id: currentUser.id }, "-created_date");
                setNotifications(userNotifications);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
            setUser(null);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await Notification.update(id, { isRead: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const clearAll = async () => {
        if (!user) return;
        try {
            // This can be slow if there are many notifications. A bulk delete function would be better.
            const deletePromises = notifications.map(n => Notification.delete(n.id));
            await Promise.all(deletePromises);
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications", error);
        }
    };
    
    if (loading) {
        return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#7cb344', borderTopColor: 'transparent' }}></div></div>
    }

    return (
        <div className="px-4 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto fade-in">
                <div className="neumorphic p-8 mb-8 rounded-3xl">
                    <h1 className="text-3xl font-bold mb-2 service-title flex items-center gap-3">
                        <Bell className="w-8 h-8" />
                        {t.notifHistoryTitle}
                    </h1>
                    <p className="text-secondary">{t.notifHistoryDescription}</p>
                </div>

                {user && notifications.length > 0 && (
                    <div className="text-right mb-4">
                        <button
                            onClick={clearAll}
                            className="neumorphic-button px-4 py-2 flex items-center gap-2 text-sm ml-auto"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            {t.clearAll}
                        </button>
                    </div>
                )}
                
                {!user ? (
                    <div className="neumorphic p-12 text-center rounded-3xl">
                         <h3 className="text-xl font-semibold text-primary mb-2">Please Log In</h3>
                         <p className="text-secondary">Log in to view your notification history.</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="neumorphic p-12 text-center rounded-3xl">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-primary mb-2">{t.noNotifHistory}</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <div key={notification.id} className={`neumorphic-pressed p-4 rounded-xl flex items-center justify-between gap-4 ${notification.isRead ? 'opacity-60' : ''}`}>
                                <div>
                                    <p className="text-primary">{notification.message}</p>
                                    <p className="text-xs text-muted mt-1">{formatDistanceToNow(parseISO(notification.created_date), { addSuffix: true, locale: dateLocale })}</p>
                                </div>
                                {!notification.isRead && (
                                    <button onClick={() => markAsRead(notification.id)} className="neumorphic-button p-2 rounded-full" title={t.markAsRead}>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}