import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReportLeakPage from './pages/ReportLeakPage';
import ExploreReportsPage from './pages/ExploreReportsPage';
import TrackReportPage from './pages/TrackReportPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedTrackId, setSelectedTrackId] = useState('');

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-surface-soft text-navy-900 selection:bg-aqua selection:text-navy-950 font-sans">
        
        {/* Navigation Bar */}
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        {/* Main Routed Page Container */}
        <main className="flex-1">
          {activePage === 'home' && (
            <HomePage 
              setActivePage={setActivePage} 
              setSelectedTrackId={setSelectedTrackId} 
            />
          )}

          {activePage === 'report' && (
            <ReportLeakPage 
              setActivePage={setActivePage} 
              setSelectedTrackId={setSelectedTrackId} 
            />
          )}

          {activePage === 'explore' && (
            <ExploreReportsPage 
              setActivePage={setActivePage} 
              setSelectedTrackId={setSelectedTrackId} 
            />
          )}

          {activePage === 'track' && (
            <TrackReportPage 
              initialTrackId={selectedTrackId} 
            />
          )}

          {activePage === 'admin' && (
            <AdminDashboardPage 
              setActivePage={setActivePage} 
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer setActivePage={setActivePage} />
      </div>
    </AuthProvider>
  );
}

export default App;
