import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "./ui/Theme";
import { updatePriceData } from "@/api/functions";

export default function PriceTicker() {
  const { language } = useTheme();
  const [prices, setPrices] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    // Initial load
    loadRealPrices();
    
    // Set up interval to refresh prices every 60 seconds (reduced frequency)
    const interval = setInterval(() => {
      loadRealPrices();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRealPrices = async () => {
    try {
      console.log('Loading real prices from Twelve Data API...');
      
      // Call the updatePriceData function to get fresh prices
      const updateResponse = await updatePriceData({});
      console.log('Update response:', updateResponse);
      
      if (updateResponse && updateResponse.data) {
        // Use the prices returned from the function
        if (updateResponse.data.prices && updateResponse.data.prices.length > 0) {
          setPrices(updateResponse.data.prices);
          setLastUpdateTime(new Date());
          console.log(`Loaded ${updateResponse.data.prices.length} prices from API`);
        } else {
          console.log('No prices in update response, using fallback');
          setPrices(getFallbackPrices());
        }
      } else {
        console.error('Invalid API response:', updateResponse);
        setPrices(getFallbackPrices());
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading real prices:', error);
      setLoading(false);
      
      // Use fallback prices on any error
      setPrices(getFallbackPrices());
    }
  };

  const getFallbackPrices = () => {
    console.log('Using fallback prices - these are sample data for display');
    return [
      { symbol: 'EURUSD', price: 1.0876, change_percent: 0.12, change: 0.0013 },
      { symbol: 'GBPUSD', price: 1.2654, change_percent: -0.08, change: -0.0010 },
      { symbol: 'USDJPY', price: 149.25, change_percent: 0.15, change: 0.22 },
      { symbol: 'XAUUSD', price: 2034.50, change_percent: 0.25, change: 5.10 },
      { symbol: 'BTCUSD', price: 43250, change_percent: 1.24, change: 530 },
      { symbol: 'AAPL', price: 189.50, change_percent: 0.35, change: 0.66 },
      { symbol: 'GOOGL', price: 142.30, change_percent: 0.28, change: 0.39 },
      { symbol: 'TSLA', price: 248.75, change_percent: -0.45, change: -1.12 }
    ];
  };

  const formatPrice = (price, symbol) => {
    if (!price || isNaN(price)) return '0.0000';
    
    const numPrice = parseFloat(price);
    
    // Format based on symbol type
    if (symbol && symbol.includes('JPY')) {
      return numPrice.toFixed(3);
    } else if (symbol && (symbol.includes('XAU') || symbol.includes('XAG'))) {
      return numPrice.toFixed(2);
    } else if (symbol && (symbol.includes('BTC') || symbol.includes('ETH'))) {
      return numPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else if (symbol && ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'].includes(symbol)) {
      return numPrice.toFixed(2);
    }
    
    return numPrice.toFixed(4);
  };

  const formatChange = (changePercent) => {
    if (!changePercent || isNaN(changePercent)) return '+0.00%';
    const formatted = Math.abs(parseFloat(changePercent)).toFixed(2);
    return `${parseFloat(changePercent) >= 0 ? '+' : '-'}${formatted}%`;
  };

  const TickerItem = ({ item }) => (
    <div className="flex-shrink-0 flex items-center gap-3 mx-6 whitespace-nowrap">
      <span className="font-semibold text-primary text-sm">
        {item.symbol || 'N/A'}
      </span>
      <span className="text-base font-bold text-primary">
        {formatPrice(item.price, item.symbol)}
      </span>
      <div className={`flex items-center gap-1 ${
        (parseFloat(item.change_percent) || 0) >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {(parseFloat(item.change_percent) || 0) >= 0 ? (
          <TrendingUp className="w-3 h-3 flex-shrink-0" />
        ) : (
          <TrendingDown className="w-3 h-3 flex-shrink-0" />
        )}
        <span className="text-xs font-medium">
          {formatChange(item.change_percent)}
        </span>
      </div>
    </div>
  );

  // Show loading state
  if (loading && prices.length === 0) {
    return (
      <div className="neumorphic-inset mx-4 mt-2 p-3 text-center">
        <div className="flex items-center justify-center gap-2 text-secondary">
          <div className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full" style={{ borderColor: '#7cb342', borderTopColor: 'transparent' }}></div>
          <span className="text-sm">
            {language === 'ar' ? 'جاري تحميل الأسعار الحية...' : 'Loading live prices...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="neumorphic-inset mx-4 mt-2 overflow-hidden py-3">
      <div 
        className="ticker-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`ticker-content ${isPaused ? 'paused' : ''}`}>
          {prices.length > 0 ? 
            [...prices, ...prices].map((item, index) => (
              <TickerItem key={`${item.symbol || index}-${index}`} item={item} />
            )) :
            <div className="flex-shrink-0 mx-6 text-secondary text-sm">
              {language === 'ar' ? 'لا توجد بيانات أسعار' : 'No price data available'}
            </div>
          }
        </div>
      </div>
      
      <style jsx>{`
        .ticker-container {
          width: 100%;
          overflow: hidden;
        }
        
        .ticker-content {
          display: flex;
          animation: scroll 60s linear infinite;
          will-change: transform;
        }
        
        .ticker-content.paused {
          animation-play-state: paused;
        }
        
        @keyframes scroll {  
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @media (max-width: 768px) {
          .ticker-content {
            animation-duration: 45s;
          }
        }
      `}</style>
    </div>
  );
}