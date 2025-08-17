import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../Layout';

// Import pages
import Homepage from './Homepage';
import Analysis from './Analysis';
import EconomicCalendar from './EconomicCalendar';
import Alerts from './Alerts';
import About from './About';
import Contact from './Contact';
import Watchlist from './Watchlist';
import Account from './Account';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main app routes with layout (includes auth provider) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/economic-calendar" element={<EconomicCalendar />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}