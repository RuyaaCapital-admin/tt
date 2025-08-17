import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/ui/Theme';
import { createPageUrl } from '@/utils';

export default function ResetPassword() {
  const { language, t } = useTheme();
  const { sendPasswordResetEmail, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    clearError();
    
    // Validate email
    if (!email) {
      setEmailError(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError(language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format');
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err) {
      // Error is handled by the auth hook
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) setEmailError('');
    if (error) clearError();
  };

  return (
    <div 
      className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Homepage')}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6cabc23a0_liiratofficialnobg.png"
              alt="Liirat"
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Reset Password Card */}
        <div className="neumorphic p-6 rounded-2xl">
          {success ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                {language === 'ar' ? 'تم إرسال البريد الإلكتروني' : 'Email Sent'}
              </h2>
              <p className="text-secondary mb-6">
                {language === 'ar' 
                  ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
                  : `Password reset link sent to ${email}`
                }
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  {language === 'ar' 
                    ? 'لم تستلم البريد الإلكتروني؟ تحقق من مجلد الرسائل غير المرغوب فيها أو جرب مرة أخرى.'
                    : "Didn't receive the email? Check your spam folder or try again."
                  }
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="neumorphic-button px-4 py-2 rounded-xl font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                </h2>
                <p className="text-secondary">
                  {language === 'ar' 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
                    : 'Enter your email address and we\'ll send you a password reset link'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`neumorphic-pressed w-full pl-10 pr-4 py-3 rounded-xl bg-transparent text-primary outline-none placeholder-secondary ${
                        emailError ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      disabled={loading}
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                {/* Global Error */}
                {error && (
                  <div className="neumorphic-inset p-3 rounded-xl border-l-4 border-red-500">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neumorphic-button py-3 px-4 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#7cb342' }}
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>
                        {language === 'ar' ? 'إرسال رابط الإعادة' : 'Send Reset Link'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Navigation Links */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Link
              to={createPageUrl('Login')}
              className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              to={createPageUrl('Homepage')}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {language === 'ar' ? 'الصفحة الرئيسية' : 'Homepage'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}