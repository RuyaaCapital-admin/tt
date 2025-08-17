import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Bell, Star } from "lucide-react";
import { useTheme } from "./ui/Theme";

export default function HeroSection() {
  const { t } = useTheme();

  return (
    <div className="neumorphic-inset p-8 md:p-16 rounded-3xl text-center relative overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
            style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f9395efd2_liiratofficialnobg.png)' }}
        ></div>
        <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold service-title mb-2">
                {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-4">{t.heroDescription}</p>
            <p className="text-md text-muted max-w-2xl mx-auto mb-8">{t.heroSubDescription}</p>

            <div className="flex flex-wrap justify-center gap-4">
                <Link to={createPageUrl("EconomicCalendar")} className="neumorphic-button px-8 py-4 font-bold rounded-xl text-lg flex items-center gap-3 transition-transform hover:scale-105" style={{ backgroundColor: '#7cb342', color: 'white' }}>
                    <Calendar className="w-6 h-6" />
                    <span>{t.economicCalendar}</span>
                </Link>
                <Link to={createPageUrl("Alerts")} className="neumorphic-button px-8 py-4 font-bold rounded-xl text-lg flex items-center gap-3 transition-transform hover:scale-105">
                    <Bell className="w-6 h-6" />
                    <span>{t.alerts}</span>
                </Link>
                <Link to={createPageUrl("Watchlist")} className="neumorphic-button px-8 py-4 font-bold rounded-xl text-lg flex items-center gap-3 transition-transform hover:scale-105">
                    <Star className="w-6 h-6" />
                    <span>{t.watchlist}</span>
                </Link>
            </div>
        </div>
    </div>
  );
}