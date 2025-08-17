

import React from "react";
import { Link, NavLink } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, Moon, Globe, Menu, X, User as UserIcon, Settings, LogOut, Home, BarChart3, Calendar, Bell, Info, Mail } from "lucide-react";
import PriceTicker from "../components/PriceTicker";
import { ThemeContext } from "../components/ui/Theme";
import { translations } from "./components/Translations.js";
import { AuthProvider, useAuth } from "../components/useAuth";
import CustomLogin from "../components/CustomLogin";

function LayoutContent({ children, currentPageName }) {
  const [theme, setTheme] = React.useState('light');
  const [language, setLanguage] = React.useState('ar');
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const { user, logout, loading } = useAuth();
  const t = translations[language];

  // Load initial settings from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('liirat-theme') || 'light';
    const savedLanguage = localStorage.getItem('liirat-language') || 'ar';

    setTheme(savedTheme);
    setLanguage(savedLanguage);
  }, []);

  // Handle scroll for navbar visibility
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNavVisible(currentScrollY <= lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('liirat-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('liirat-language', language);
  }, [language]);

  // Listen for login modal trigger
  React.useEffect(() => {
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };
    
    window.addEventListener('show-login-modal', handleShowLoginModal);
    return () => window.removeEventListener('show-login-modal', handleShowLoginModal);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    localStorage.setItem('liirat-language', newLanguage);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogout = async () => {
    if (!window.confirm(language === 'ar' ? 'هل تريد تسجيل الخروج؟' : 'Are you sure you want to logout?')) return;
    try {
      await logout();
      setShowUserMenu(false);
      window.location.reload(); // Refresh to ensure clean state
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation links with different button sizes
  const navLinks = [
    { page: "Homepage", label: t.home, icon: Home, size: 'normal' },
    { page: "EconomicCalendar", label: t.calendar, icon: Calendar, size: 'large' },
    { page: "Alerts", label: t.alerts, icon: Bell, size: 'large' },
    { page: "AIAssistant", label: language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant', icon: BarChart3, size: 'normal' },
    { page: "About", label: t.about, icon: Info, size: 'icon-only' },
    { page: "Contact", label: t.contact, icon: Mail, size: 'icon-only' }
  ];

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
          
          /* GLOBAL THEME VARIABLES */
          .light-theme {
            --bg-primary: #ffffff;
            --bg-secondary: #ffffff;
            --bg-card: #ffffff;
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --text-muted: #6b7280;
            --shadow-light: #ffffff;
            --shadow-dark: #d1d5db;
            --accent: #7cb342;
          }
          
          .dark-theme {
            --bg-primary: #121212;
            --bg-secondary: #121212;
            --bg-card: #1e1e1e;
            --text-primary: #ffffff;
            --text-secondary: #e0e0e0;
            --text-muted: #9ca3af;
            --shadow-light: #2a2a2a;
            --shadow-dark: #0a0a0a;
            --accent: #8fcc52;
          }

          /* FORCE BACKGROUND COLORS */
          html, body {
            background-color: var(--bg-primary) !important;
            color: var(--text-primary) !important;
            margin: 0;
            padding: 0;
          }

          * {
            box-sizing: border-box;
          }

          /* NEUMORPHIC COMPONENTS */
          .neumorphic, .neumorphic-raised {
            background: var(--bg-card) !important;
            box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
            border-radius: 16px;
            transition: all 0.3s ease;
          }
          
          .neumorphic-inset, .neumorphic-pressed {
            background: var(--bg-primary) !important;
            box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
            border-radius: 16px;
          }
          
          .neumorphic-button {
            background: var(--bg-card) !important;
            box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
            border-radius: 12px;
            transition: all 0.2s ease-in-out;
            color: var(--text-primary) !important;
            border: none;
            outline: none;
          }
          
          .neumorphic-button:hover {
            transform: translateY(-3px);
            box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light);
          }
          
          .neumorphic-button:active {
            transform: translateY(0px) scale(0.97);
            box-shadow: inset 5px 5px 10px var(--shadow-dark), inset -5px -5px 10px var(--shadow-light);
          }

          /* TEXT COLORS */
          .text-primary { color: var(--text-primary) !important; }
          .text-secondary { color: var(--text-secondary) !important; }
          .text-muted { color: var(--text-muted) !important; }

          /* OVERRIDE TAILWIND CLASSES */
          .text-gray-900, .text-gray-800, .text-gray-700 { color: var(--text-primary) !important; }
          .text-gray-600 { color: var(--text-secondary) !important; }
          .text-gray-500, .text-gray-400 { color: var(--text-muted) !important; }
          .text-white { color: var(--text-primary) !important; }

          /* SERVICE TITLE GRADIENT */
          .service-title {
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
            padding-bottom: 0.1em;
          }

          /* FORM ELEMENTS */
          input, textarea, select {
            color: var(--text-primary) !important;
            background-color: transparent !important;
          }
          
          select option {
            background: var(--bg-card) !important;
            color: var(--text-primary) !important;
          }

          /* ANIMATIONS */
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* NAVIGATION TRANSITIONS */
          .navbar-hidden { transform: translateY(-100%); }
          .navbar-visible { transform: translateY(0); }

          /* BACKGROUND CLASSES */
          .bg-light-bg { background-color: var(--bg-primary) !important; }
          .bg-dark-bg { background-color: var(--bg-primary) !important; }

          .nav-link-active {
            box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light) !important;
            color: var(--accent) !important;
          }

          /* STICKY LAST COLUMN FOR ACTIONS */
          .table-container {
            position: relative;
            overflow-x: auto;
          }
          
          .sticky-actions {
            position: sticky;
            right: 0;
            z-index: 10;
            background: inherit;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
          }

          /* RTL SUPPORT FOR STICKY COLUMN */
          [dir="rtl"] .sticky-actions {
            left: 0;
            right: auto;
            box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
          }

          /* ACCESSIBILITY - MIN CONTRAST RATIO 4.5:1 */
          .high-contrast-text {
            color: var(--text-primary);
            font-weight: 500;
          }

          /* MOBILE RESPONSIVE ADJUSTMENTS */
          @media (max-width: 767px) {
            .mobile-time-badge {
              position: absolute;
              top: 8px;
              right: 8px;
              z-index: 5;
            }
            
            [dir="rtl"] .mobile-time-badge {
              left: 8px;
              right: auto;
            }
          }
        `}</style>

        <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${isNavVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
          <nav className="menu-container">
            <div className="neumorphic mx-4 mt-4 p-4 rounded-2xl">
              <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <div className="flex items-center gap-4">
                  <Link to={createPageUrl("Homepage")} className="flex items-center gap-3">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6cabc23a0_liiratofficialnobg.png"
                      alt="Liirat"
                      className="h-10 w-auto"
                    />
                  </Link>
                </div>

                {/* Desktop Navigation - Different Sizes */}
                <div className="hidden lg:flex items-center gap-1">
                  {navLinks.map(link => {
                    const sizeClasses = {
                      small: 'px-2 py-1.5 text-xs',
                      normal: 'px-3 py-2 text-xs',
                      large: 'px-4 py-3 text-sm',
                      'icon-only': 'p-2'
                    };
                    
                    return (
                      <NavLink
                        key={link.page}
                        to={createPageUrl(link.page)}
                        className={({ isActive }) => 
                          `neumorphic-button ${sizeClasses[link.size]} rounded-xl font-medium transition-all flex items-center gap-2 ${
                            isActive ? 'nav-link-active' : ''
                          }`
                        }
                        title={link.label}
                      >
                        <link.icon className={link.size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
                        {link.size !== 'icon-only' && <span>{link.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden lg:flex items-center gap-2">
                  {/* User Profile/Login Button */}
                  {!loading && (
                    <div className="relative">
                      {user ? (
                        <button
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="neumorphic-button p-3 rounded-xl flex items-center gap-2"
                          title={user.full_name || user.email}
                        >
                          <UserIcon className="w-5 h-5" />
                          <span className="text-sm font-medium hidden xl:inline truncate max-w-32">
                            {user.full_name || user.email?.split('@')[0]}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="neumorphic-button p-3 rounded-xl flex items-center gap-2 font-medium"
                          style={{ color: '#7cb342' }}
                          title={language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                        >
                          <UserIcon className="w-5 h-5" />
                          <span className="text-sm hidden xl:inline">{language === 'ar' ? 'دخول' : 'Sign In'}</span>
                        </button>
                      )}

                      {/* User Menu */}
                      {showUserMenu && user && (
                        <div className={`absolute top-full mt-2 ${language === 'ar' ? 'left-0' : 'right-0'} w-64 neumorphic p-4 z-50 rounded-2xl fade-in`}>
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="w-12 h-12 neumorphic-raised rounded-full flex items-center justify-center">
                              <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-primary truncate">{user.full_name || user.email}</p>
                              <p className="text-sm text-secondary truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Link
                              to={createPageUrl("Account")}
                              className="block neumorphic-button p-3 text-center rounded-xl transition-all"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="w-4 h-4 inline mr-2" />
                              {language === 'ar' ? 'الإعدادات' : 'Settings'}
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLogout();
                              }}
                              className="w-full neumorphic-button p-3 text-center rounded-xl transition-all text-red-600"
                            >
                              <LogOut className="w-4 h-4 inline mr-2" />
                              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Language Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className="neumorphic-button p-2 rounded-xl flex items-center gap-2"
                    title={language === 'ar' ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium">{language === 'ar' ? 'EN' : 'عر'}</span>
                  </button>
                  
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="neumorphic-button p-2 rounded-xl flex items-center gap-1"
                    title={theme === 'light' 
                      ? (language === 'ar' ? 'تبديل إلى المظهر الداكن' : 'Switch to dark mode')
                      : (language === 'ar' ? 'تبديل إلى المظهر الفاتح' : 'Switch to light mode')
                    }
                  >
                    {theme === 'light' ?
                      <Moon className="w-4 h-4" /> :
                      <Sun className="w-4 h-4 text-yellow-400" />
                    }
                    <span className="text-xs font-medium hidden xl:inline">
                      {theme === 'light' 
                        ? (language === 'ar' ? 'داكن' : 'Dark') 
                        : (language === 'ar' ? 'فاتح' : 'Light')
                      }
                    </span>
                  </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center gap-2">
                  {/* Mobile User Button */}
                  {!loading && (
                    <div className="relative">
                      {user ? (
                        <button
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="neumorphic-button p-3 rounded-xl"
                          title={language === 'ar' ? 'قائمة المستخدم' : 'User menu'}
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="neumorphic-button p-3 rounded-xl"
                          style={{ color: '#7cb342' }}
                          title={language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Mobile User Menu */}
                      {showUserMenu && user && (
                        <div className="absolute top-full mt-2 right-0 w-48 neumorphic p-3 z-50 rounded-xl fade-in">
                          <div className="text-center mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <p className="font-medium text-primary text-sm truncate">{user.full_name || user.email}</p>
                            <p className="text-xs text-secondary truncate">{user.email}</p>
                          </div>
                          <div className="space-y-2">
                            <Link
                              to={createPageUrl("Account")}
                              className="block neumorphic-button p-2 text-center rounded-lg text-sm"
                              onClick={() => setShowUserMenu(false)}
                            >
                              {language === 'ar' ? 'الإعدادات' : 'Settings'}
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLogout();
                              }}
                              className="w-full neumorphic-button p-2 text-center rounded-lg text-sm text-red-600"
                            >
                              {language === 'ar' ? 'خروج' : 'Logout'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={toggleLanguage}
                    className="neumorphic-button p-3 rounded-xl transition-all"
                    title={language === 'ar' ? 'تغيير اللغة' : 'Toggle language'}
                  >
                    <Globe className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="neumorphic-button p-3 rounded-xl transition-all"
                    title={language === 'ar' ? 'تغيير المظهر' : 'Toggle theme'}
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="neumorphic-button p-3 rounded-xl"
                    title={language === 'ar' ? 'القائمة' : 'Menu'}
                  >
                    {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Panel - WITH ICONS */}
            {showMobileMenu && (
              <div className="lg:hidden neumorphic mx-4 mt-2 p-4 rounded-2xl fade-in">
                <div className="flex flex-col space-y-3">
                  {navLinks.map(link => (
                    <NavLink
                      key={link.page}
                      to={createPageUrl(link.page)}
                      className={({ isActive }) => 
                        `neumorphic-button p-3 text-center rounded-xl font-medium flex items-center justify-center gap-2 ${
                          isActive ? 'nav-link-active' : ''
                        }`
                      }
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                  
                  {/* Mobile User Actions */}
                  {!loading && (
                    <>
                      {user ? (
                        <>
                          <NavLink
                            to={createPageUrl("Account")}
                            className={({ isActive }) => 
                              `neumorphic-button p-3 text-center rounded-xl font-medium flex items-center justify-center gap-2 ${
                                isActive ? 'nav-link-active' : ''
                              }`
                            }
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            {language === 'ar' ? 'الإعدادات' : 'Settings'}
                          </NavLink>
                          <button
                            onClick={() => {
                              setShowMobileMenu(false);
                              handleLogout();
                            }}
                            className="neumorphic-button p-3 text-center rounded-xl font-medium text-red-600 flex items-center justify-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setShowMobileMenu(false);
                            setShowLoginModal(true);
                          }}
                          className="neumorphic-button p-3 text-center rounded-xl font-medium flex items-center justify-center gap-2"
                          style={{ color: '#7cb342' }}
                        >
                          <UserIcon className="w-4 h-4" />
                          {language === 'ar' ? 'دخول' : 'Sign In'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </nav>

          <PriceTicker />
        </div>

        <main className="min-h-screen pt-44 lg:pt-48 fade-in">
          {children}
        </main>

        {/* Custom Login Modal */}
        <CustomLogin
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectUrl="/"
        />
      </div>
    </ThemeContext.Provider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </AuthProvider>
  );
}

