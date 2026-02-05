
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/icons/Notification';
import ErrorBoundary from './components/icons/ErrorBoundary';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import EmergencyTools from './components/EmergencyTools';

// Lazy load
const Dashboard = lazy(() => import('./components/Dashboard'));
const PublicSite = lazy(() => import('./components/PublicSite'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));

const SimpleLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen w-full bg-white text-gray-500">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <span>Loading System...</span>
  </div>
);

const AppContent: React.FC<{ isAdmin: boolean; onLogin: () => void; onLogout: () => void }> = ({ isAdmin, onLogin, onLogout }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  if (currentPath.startsWith('/site')) {
      return <PublicSite route={currentPath} isAdmin={isAdmin} />;
  }

  if (!isAdmin) {
      return <AdminLogin onLoginSuccess={onLogin} />;
  }
  
  if (currentPath === '/admin/settings') {
      return <SettingsPage />;
  }

  return <Dashboard publishedCount={0} onLogout={onLogout} />;
};

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
      // Force immediate readiness to prevent white screen
      const hasAuth = !!sessionStorage.getItem('adminPassword');
      setIsAdmin(hasAuth);
      setIsReady(true);
      
      if (window.location.pathname === '/') {
        window.history.replaceState({}, '', '/admin');
      }
  }, []);

  if (!isReady) return <SimpleLoader />;

  return (
    <ErrorBoundary>
        <EmergencyTools />
        <NotificationProvider>
          <SettingsProvider>
            <DataProvider isAdmin={isAdmin}>
              <div className="bg-white text-gray-900 min-h-screen font-sans">
                  <Suspense fallback={<SimpleLoader />}>
                    <AppContent isAdmin={isAdmin} onLogin={() => setIsAdmin(true)} onLogout={() => { sessionStorage.removeItem('adminPassword'); setIsAdmin(false); }} />
                  </Suspense>
                  <Notification />
              </div>
            </DataProvider>
          </SettingsProvider>
        </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
