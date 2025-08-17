import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@/api/entities';
import { authenticateUser } from '@/api/functions';

// Local storage key for session persistence
const USER_SESSION_KEY = 'liirat-user-session';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication state on mount and persist across pages
  useEffect(() => {
    loadAuthState();
  }, []);

  // Listen for auth changes across components
  useEffect(() => {
    const handleAuthChange = () => {
      loadAuthState();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const loadAuthState = () => {
    try {
      const savedSession = localStorage.getItem(USER_SESSION_KEY);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        // Validate session data
        if (sessionData && sessionData.id && sessionData.email) {
          setUser(sessionData);
        } else {
          localStorage.removeItem(USER_SESSION_KEY);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      localStorage.removeItem(USER_SESSION_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const saveAuthState = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
    // Notify other components of auth change
    window.dispatchEvent(new Event('auth-changed'));
  };

  const login = async ({ email, password, rememberMe = false }) => {
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call our authentication function
      const response = await authenticateUser({
        action: 'login',
        email: email.trim(),
        password
      });

      const { data } = response;

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Authentication failed';
        throw new Error(errorMessage);
      }

      // Save user session with proper structure
      const userData = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        preferred_language: data.user.preferred_language || 'ar',
        timezone: data.user.timezone || 'UTC',
        remember_me: rememberMe,
        login_time: new Date().toISOString()
      };

      saveAuthState(userData);
      return { success: true, user: userData };

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Network/API errors
        if (error.response.status === 401) {
          const errorData = error.response.data;
          errorMessage = errorData?.error || 'Invalid credentials';
        } else if (error.response.status === 400) {
          const errorData = error.response.data;
          errorMessage = errorData?.error || 'Invalid request';
        }
      } else if (error.message) {
        // Custom error messages
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, name }) => {
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!name || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      // Call our authentication function for signup
      const response = await authenticateUser({
        action: 'signup',
        email: email.trim(),
        password,
        name: name.trim()
      });

      const { data } = response;

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Signup failed';
        throw new Error(errorMessage);
      }

      // Save user session
      const userData = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        preferred_language: data.user.preferred_language || 'ar',
        timezone: data.user.timezone || 'UTC',
        signup_time: new Date().toISOString()
      };

      saveAuthState(userData);
      return { success: true, user: userData };

    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 400) {
          const errorData = error.response.data;
          errorMessage = errorData?.error || 'Invalid request';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local session
      saveAuthState(null);
      setError(null);
      
      // Also try to logout from Base44 if user is logged in there (but don't fail if it doesn't work)
      try {
        await User.logout();
      } catch (error) {
        // Ignore Base44 logout errors - we've already cleared local session
        console.log('Base44 logout not needed or failed - using local auth');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      saveAuthState(null);
      setError(null);
    }
  };

  const sendPasswordResetEmail = async (email) => {
    setError(null);
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate password reset for now
      return { success: true, message: 'Password reset instructions have been sent to your email' };
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to send password reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = { ...user, ...updates };
      saveAuthState(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error('Failed to update profile: ' + error.message);
    }
  };

  const refreshAuth = () => {
    loadAuthState();
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    sendPasswordResetEmail,
    updateProfile,
    clearError: () => setError(null),
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};