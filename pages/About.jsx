import React from "react";
import WhyLiirat from "../components/WhyLiirat";
import { useTheme } from "../components/ui/Theme";
import { Target, Database, Cpu } from "lucide-react";

export default function About() {
  const { language, t } = useTheme();

  return (
    <div className="py-8 bg-light-bg dark:bg-dark-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 service-title relative">
            <span className="absolute inset-0 bg-white/30 dark:bg-white/10 blur-lg rounded-lg -z-10"></span>
            {t.aboutTitle}
          </h1>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 space-y-16">
        {/* Mission */}
        <div className="neumorphic p-8 text-center">
            <div className="w-16 h-16 neumorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8" style={{ color: 'var(--accent)' }}/>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">{t.missionTitle}</h2>
            <p className="text-lg text-secondary leading-relaxed">{t.missionText}</p>
        </div>

        {/* Data & Sources */}
        <div className="neumorphic p-8 text-center">
            <div className="w-16 h-16 neumorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8" style={{ color: 'var(--accent)' }}/>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">{t.sourcesTitle}</h2>
            <p className="text-lg text-secondary leading-relaxed">{t.sourcesText}</p>
        </div>
        
        {/* AI Technology */}
        <div className="neumorphic p-8 text-center">
            <div className="w-16 h-16 neumorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
                <Cpu className="w-8 h-8" style={{ color: 'var(--accent)' }}/>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">{t.aiTechTitle}</h2>
            <p className="text-lg text-secondary leading-relaxed">{t.aiTechText}</p>
        </div>
      </div>
      
      <div className="mt-16">
        <WhyLiirat />
      </div>
    </div>
  );
}