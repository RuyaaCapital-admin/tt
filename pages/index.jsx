import Layout from "./Layout.jsx";

import Homepage from "./Homepage";

import Alerts from "./Alerts";

import EconomicCalendar from "./EconomicCalendar";

import About from "./About";

import Contact from "./Contact";

import Watchlist from "./Watchlist";

import NotificationSettings from "./NotificationSettings";

import NotificationHistory from "./NotificationHistory";

import Account from "./Account";

import ResetPassword from "./ResetPassword";

import App from "./App";

import AIAssistant from "./AIAssistant";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Homepage: Homepage,
    
    Alerts: Alerts,
    
    EconomicCalendar: EconomicCalendar,
    
    About: About,
    
    Contact: Contact,
    
    Watchlist: Watchlist,
    
    NotificationSettings: NotificationSettings,
    
    NotificationHistory: NotificationHistory,
    
    Account: Account,
    
    ResetPassword: ResetPassword,
    
    App: App,
    
    AIAssistant: AIAssistant,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Homepage />} />
                
                
                <Route path="/Homepage" element={<Homepage />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/EconomicCalendar" element={<EconomicCalendar />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Watchlist" element={<Watchlist />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/NotificationHistory" element={<NotificationHistory />} />
                
                <Route path="/Account" element={<Account />} />
                
                <Route path="/ResetPassword" element={<ResetPassword />} />
                
                <Route path="/App" element={<App />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}