import React from "react";
import AlertsSystem from "../components/AlertsSystem";
import { useTheme } from "../components/ui/Theme";

export default function Alerts() {
  const { language, t } = useTheme();
  const [notifications, setNotifications] = React.useState([]);

  const handleNotificationAdd = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    const storedNotifications = JSON.parse(localStorage.getItem('liirat-notifications') || '[]');
    const updatedNotifications = [notification, ...storedNotifications].slice(0, 10);
    localStorage.setItem('liirat-notifications', JSON.stringify(updatedNotifications));
    
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="py-8 bg-light-bg dark:bg-dark-bg">
      <AlertsSystem onNotificationAdd={handleNotificationAdd} />
    </div>
  );
}