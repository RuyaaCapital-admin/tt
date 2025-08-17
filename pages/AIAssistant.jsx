
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ui/Theme";
import { useAuth } from "@/components/useAuth";
import { Brain, Send, Image, User, Bot } from "lucide-react";
import { chatWithAI } from "@/api/functions";
import { UploadFile } from "@/api/integrations";
import ProtectedRoute from "../components/ProtectedRoute";

const ChatMessage = ({ message, isUser, language }) => {
  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-500' : 'neumorphic'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5" style={{ color: '#7cb342' }} />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 text-white ml-2' 
            : 'neumorphic-pressed text-primary mr-2'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 mb-6">
    <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center flex-shrink-0">
      <Bot className="w-5 h-5" style={{ color: '#7cb342' }} />
    </div>
    <div className="neumorphic-pressed px-4 py-3 rounded-2xl">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

const TradingViewChart = ({ theme }) => {
  const widgetRef = React.useRef(null);

  React.useEffect(() => {
    // Clear any existing content
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
    }

    // Create the widget container
    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.position = 'relative';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = 'calc(100% - 32px)';
    widget.style.width = '100%';

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    copyright.style.position = 'relative';

    // Create overlay to hide copyright
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.bottom = '0';
    overlay.style.right = '0';
    overlay.style.left = '0';
    overlay.style.height = '32px';
    overlay.style.background = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    overlay.style.zIndex = '10';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.innerHTML = '<div style="background: rgba(124, 179, 66, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #7cb342;">Powered by Liirat</div>';

    container.appendChild(widget);
    container.appendChild(copyright);
    container.appendChild(overlay);

    // Create and configure the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    const config = {
      "allow_symbol_change": true,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": false,
      "interval": "15",
      "locale": "en",
      "save_image": true,
      "style": "1",
      "symbol": "OANDA:XAUUSD",
      "theme": theme === 'dark' ? 'dark' : 'light',
      "timezone": "Etc/UTC",
      "backgroundColor": theme === 'dark' ? "#1a1a1a" : "#ffffff",
      "gridColor": theme === 'dark' ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.06)",
      "watchlist": [],
      "withdateranges": false,
      "compareSymbols": [],
      "studies": [],
      "width": "100%",
      "height": "100%"
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    if (widgetRef.current) {
      widgetRef.current.appendChild(container);
    }

  }, [theme]);

  return <div ref={widgetRef} style={{ width: '100%', height: '100%' }} />;
};

function AIAssistantContent() {
  const { language, t, theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const fileInputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const isRTL = language === 'ar';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send personalized greeting when user is available
  useEffect(() => {
    if (user && !hasGreeted) {
      const greeting = language === 'ar' 
        ? `مرحباً ${user.full_name || user.email?.split('@')[0]}! أنا مساعد ليرات الذكي للأسواق المالية.\n\n🔹 تحليل فوري للأسعار والأسواق\n🔹 تحليل الصفقات والمخططات البيانية\n🔹 استراتيجيات تداول مخصصة\n🔹 إدارة المخاطر المتقدمة\n🔹 متابعة الأخبار والأحداث\n\nيمكنك رفع صور للمخططات أو الصفقات لتحليلها.\n\nكيف يمكنني مساعدتك اليوم؟`
        : `Hello ${user.full_name || user.email?.split('@')[0]}! I'm Liirat's Advanced AI Assistant for financial markets.\n\n🔹 Real-time market analysis & insights\n🔹 Trading chart & trade analysis\n🔹 Custom trading strategies\n🔹 Advanced risk management\n🔹 Live news & event monitoring\n\nYou can upload chart images or trade screenshots for analysis.\n\nHow can I assist you today?`;
      
      setMessages([{ text: greeting, isUser: false }]);
      setHasGreeted(true);
    }
  }, [user, hasGreeted, language]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى رفع صورة فقط' : 'Please upload images only');
      return;
    }

    try {
      setIsTyping(true);
      
      const uploadResult = await UploadFile({ file });
      const imageUrl = uploadResult.file_url;
      
      const imageMessage = language === 'ar' 
        ? '📊 تم رفع مخطط للتحليل المتقدم'
        : '📊 Chart uploaded for advanced analysis';
      
      setMessages(prev => [...prev, { text: imageMessage, isUser: true }]);
      
      const response = await chatWithAI({
        message: language === 'ar' 
          ? 'يرجى تحليل هذا المخطط البياني بشكل متقدم وتقديم توصيات تداول مفصلة مع تحليل المؤشرات الفنية وإدارة المخاطر'
          : 'Please provide advanced analysis of this chart with detailed trading recommendations, technical indicators analysis, and risk management',
        language: language,
        conversationHistory: messages.slice(-10),
        imageUrl: imageUrl
      });

      const { data } = response;
      
      if (data.success) {
        setMessages(prev => [...prev, { text: data.response, isUser: false }]);
      } else {
        const errorMessage = language === 'ar' 
          ? 'فشل تحليل الصورة. يرجى المحاولة مرة أخرى.'
          : 'Failed to analyze image. Please try again.';
        setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = language === 'ar' 
        ? 'فشل رفع الصورة'
        : 'Failed to upload image';
      alert(errorMessage);
    } finally {
      setIsTyping(false);
      event.target.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsTyping(true);

    try {
      const response = await chatWithAI({
        message: userMessage,
        language: language,
        conversationHistory: messages.slice(-12)
      });

      const { data } = response;
      
      if (data.success) {
        setMessages(prev => [...prev, { text: data.response, isUser: false }]);
      } else {
        const errorMessage = language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, there was an error. Please try again.';
        setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = language === 'ar' 
        ? 'عذراً، لا يمكنني الاتصال بالخادم الآن.'
        : 'Sorry, I can\'t connect to the server right now.';
      setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="neumorphic p-8 rounded-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3 service-title">
              <Brain className="w-8 h-8" style={{ color: '#7cb342' }} />
              {language === 'ar' ? 'مساعد ليرات الذكي' : 'Liirat AI Assistant'}
            </h1>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'مساعد ذكي متطور للتحليل المالي واستشارات التداول المخصصة'
                : 'Advanced AI assistant for financial analysis and personalized trading consultation'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-1">
            <div className="neumorphic h-[600px] flex flex-col rounded-3xl">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isUser={message.isUser}
                    language={language}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="neumorphic-button p-3 rounded-xl transition-all hover:scale-110 flex-shrink-0"
                    title={language === 'ar' ? 'رفع مخطط للتحليل' : 'Upload chart for analysis'}
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="flex-1 neumorphic-pressed rounded-xl flex items-center">
                    <input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={language === 'ar' ? 'اسأل عن التداول والأسواق...' : 'Ask about trading and markets...'}
                      className="flex-1 px-4 py-3 bg-transparent text-primary outline-none"
                      disabled={isTyping}
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="neumorphic-button p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 flex-shrink-0"
                    style={{ backgroundColor: inputMessage.trim() && !isTyping ? '#7cb342' : undefined }}
                    title={language === 'ar' ? 'إرسال' : 'Send'}
                  >
                    <Send className={`w-5 h-5 ${inputMessage.trim() && !isTyping ? 'text-white' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="lg:col-span-1">
            <div className="neumorphic p-4 h-[600px] rounded-3xl">
              <TradingViewChart theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  return (
    <ProtectedRoute>
      <AIAssistantContent />
    </ProtectedRoute>
  );
}
