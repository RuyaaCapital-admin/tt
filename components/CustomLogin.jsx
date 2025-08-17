
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { useTheme } from './ui/Theme';

export default function CustomLogin({ isOpen, onClose, redirectUrl = "/" }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Removed fieldErrors, using localError for general validation messages
  // Removed isSubmitting, now using 'loading' from useAuth
  // Removed successMessage state, modal closes on success

  const [localError, setLocalError] = useState(''); // For client-side validation errors

  const { login, signup, loading, error, clearError } = useAuth(); // Added 'loading'
  const { language, t } = useTheme();

  // Reset form and errors when modal opens/closes or tab changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        rememberMe: false
      });
      setLocalError(''); // Clear local validation errors
      clearError(); // Clear auth context errors
    }
  }, [isOpen, activeTab, clearError]);

  // Clear auth error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!isOpen) return null;

  // Removed validateForm function, now handled inline in handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Clear local validation errors
    clearError(); // Clear auth context errors

    // --- Inline Validation ---
    if (!formData.email.trim()) {
      setLocalError(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setLocalError(language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format');
      return;
    }
    if (!formData.password.trim()) {
      setLocalError(language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError(language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    const isSignup = activeTab === 'signup'; // Determine if it's signup mode

    if (isSignup) {
      if (!formData.name.trim()) {
        setLocalError(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
        return;
      }
      if (!formData.confirmPassword.trim()) {
        setLocalError(language === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Confirm password is required');
        return;
      } else if (formData.password !== formData.confirmPassword) {
        setLocalError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return;
      }
    }
    // --- End Inline Validation ---

    try {
      let result;
      if (isSignup) {
        result = await signup({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim()
        });
      } else {
        result = await login({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe
        });
      }

      if (result.success) {
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          rememberMe: false
        });

        // Close modal
        onClose();

        // Small delay to ensure auth state is updated before redirect/reload
        setTimeout(() => {
          if (redirectUrl && redirectUrl !== window.location.pathname) {
            window.location.href = redirectUrl;
          } else {
            // Just reload the current page to refresh auth state
            window.location.reload();
          }
        }, 100);
      }
      // If result.success is false, the 'error' state from useAuth should be set and displayed.
    } catch (err) {
      // Any uncaught errors from the auth function would land here.
      // However, typically the auth hook manages its own error state.
      console.error(isSignup ? 'Signup error:' : 'Login error:', err);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear any local validation errors when user starts typing
    if (localError) {
      setLocalError('');
    }
    // Clear general error from auth context
    if (error) {
      clearError();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="neumorphic max-w-md w-full rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
            </h2>
            <button onClick={onClose} className="neumorphic-button p-2 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex neumorphic-inset rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'signin' 
                  ? 'neumorphic-button text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'signup' 
                  ? 'neumorphic-button text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {language === 'ar' ? 'حساب جديد' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pt-0">
          {/* Error Message (combining local and auth errors) */}
          {(localError || error) && (
            <div className="mb-4 p-3 neumorphic-inset rounded-xl flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Signup only) */}
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto' }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className={`neumorphic-pressed w-full py-3 rounded-xl outline-none text-primary bg-transparent`} // Removed fieldErrors class
                    style={{ paddingLeft: language === 'ar' ? '16px' : '44px', paddingRight: language === 'ar' ? '44px' : '16px' }}
                    disabled={loading}
                  />
                  {/* Removed fieldErrors.name message */}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`neumorphic-pressed w-full py-3 rounded-xl outline-none text-primary bg-transparent`} // Removed fieldErrors class
                  style={{ paddingLeft: language === 'ar' ? '16px' : '44px', paddingRight: language === 'ar' ? '44px' : '16px' }}
                  disabled={loading}
                  autoComplete="email"
                />
                {/* Removed fieldErrors.email message */}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`neumorphic-pressed w-full py-3 rounded-xl outline-none text-primary bg-transparent`} // Removed fieldErrors class
                  style={{ paddingLeft: language === 'ar' ? '44px' : '44px', paddingRight: language === 'ar' ? '44px' : '44px' }}
                  disabled={loading}
                  autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  style={{ right: language === 'ar' ? 'auto' : '12px', left: language === 'ar' ? '12px' : 'auto' }}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {/* Removed fieldErrors.password message */}
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                    className={`neumorphic-pressed w-full py-3 rounded-xl outline-none text-primary bg-transparent`} // Removed fieldErrors class
                    style={{ paddingLeft: language === 'ar' ? '44px' : '44px', paddingRight: language === 'ar' ? '44px' : '44px' }}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ right: language === 'ar' ? 'auto' : '12px', left: language === 'ar' ? '12px' : 'auto' }}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {/* Removed fieldErrors.confirmPassword message */}
                </div>
              </div>
            )}

            {/* Remember Me (Signin only) */}
            {activeTab === 'signin' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-secondary">
                  {language === 'ar' ? 'تذكرني' : 'Remember me'}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="neumorphic-button w-full py-3 px-4 font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white"
              style={{ backgroundColor: '#7cb342' }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                </div>
              ) : (
                activeTab === 'signin' 
                  ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                  : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')
              )}
            </button>
          </form>

          {/* Footer Links */}
          {activeTab === 'signin' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {/* Add forgot password logic */}}
                className="text-sm text-secondary hover:text-primary transition-colors"
                disabled={loading}
              >
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
