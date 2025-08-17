import React from "react";
import HeroSection from "../components/HeroSection";
import EconomicCalendarTable from "../components/EconomicCalendarTable";
import AlertsSystem from "../components/AlertsSystem";
import WhyLiirat from "../components/WhyLiirat";
import ContactForm from "../components/ContactForm";
import { useTheme } from "../components/ui/Theme";

export default function Homepage() {
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
    <div className="bg-light-bg dark:bg-dark-bg">
      <HeroSection />
      <EconomicCalendarTable onNotificationAdd={handleNotificationAdd} />
      <AlertsSystem onNotificationAdd={handleNotificationAdd} />
      <WhyLiirat />
      <ContactForm />
    </div>
  );
}