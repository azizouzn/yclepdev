
import React, { useState, useEffect } from 'react';
import YclepLogo from './icons/YclepLogo';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import ServerIcon from './icons/ServerIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState('');
  
  // Health Check State
  const [dbHealth, setDbHealth] = useState<{ status: 'checking' | 'healthy' | 'unhealthy'; latency?: number; msg?: string }>({ status: 'checking' });

  useEffect(() => {
      checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
      try {
          const res = await fetch('/api/health');
          const data = await res.json();
          if (res.ok && data.status === 'healthy') {
              setDbHealth({ status: 'healthy', latency: data.latency });
          } else {
              setDbHealth({ status: 'unhealthy', msg: data.error || 'Connection Failed' });
          }
      } catch (e) {
          setDbHealth({ status: 'unhealthy', msg: 'API Unreachable' });
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    // In a production-ready app, you'd typically verify the password against a backend endpoint here.
    // For this architecture, we'll store the password in the session and let the server-side API endpoints
    // verify it on each request.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    sessionStorage.setItem('adminPassword', password);
    onLoginSuccess();
    
    setIsLoading(false);
  };

  const handleOneClickSetup = async () => {
      setIsLoading(true);
      setSetupStatus('Initializing database...');
      try {
          const res = await fetch('/api/system/setup', { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
              setSetupStatus('✅ Success! Database ready.');
              checkSystemHealth(); // Re-check health
          } else {
              setSetupStatus(`❌ Error: ${data.message || 'Failed'}`);
          }
      } catch (e) {
          setSetupStatus('❌ Connection failed.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
        
        {/* Top Status Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${dbHealth.status === 'healthy' ? 'bg-green-500' : dbHealth.status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

        <div className="text-center">
            <div className="flex items-center justify-center mb-6">
                <div className="w-48 h-auto">
                    <YclepLogo className="w-full h-full" />
                </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Admin Access</h2>
            
            {/* Connection Status Badge */}
            <div className="mt-3 flex justify-center">
                {dbHealth.status === 'checking' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ServerIcon className="w-3 h-3 mr-1 animate-pulse" /> Connecting to Supabase...
                    </span>
                )}
                {dbHealth.status === 'healthy' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" /> Online ({dbHealth.latency}ms)
                    </span>
                )}
                {dbHealth.status === 'unhealthy' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-3 h-3 mr-1" /> {dbHealth.msg}
                    </span>
                )}
            </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter Admin Password"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && !setupStatus ? (
                  <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                  </span>
              ) : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-center">
            <p className="text-xs text-blue-600">
                <span className="font-semibold">Tip:</span> Default password generated is <code>admin123</code>
            </p>
        </div>

        {/* Mobile Setup Tool */}
        <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Having trouble connecting?</p>
            <button 
                type="button"
                onClick={handleOneClickSetup}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
                {isLoading && setupStatus ? (
                    <span className="flex items-center text-indigo-600">
                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Running Diagnostics...
                    </span>
                ) : (
                    <>
                        <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-gray-500"/>
                        Re-Initialize Database
                    </>
                )}
            </button>
            {setupStatus && (
                <p className={`text-xs text-center mt-2 font-semibold ${setupStatus.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>
                    {setupStatus}
                </p>
            )}
        </div>

         <div className="text-center">
            <a href="/site" className="font-medium text-sm text-indigo-600 hover:text-indigo-500 hover:underline">
              &larr; Back to Public Site
            </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
