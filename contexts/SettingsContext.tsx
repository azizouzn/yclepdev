
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { ApiProviderSettings } from '../types';
import { getSettingsStatus } from '../services/mastermindService';

type ProviderStatus = ApiProviderSettings & { isConfigured: boolean };

interface SettingsContextType {
  providers: ProviderStatus[];
  isConfigured: boolean; // Is at least one provider configured?
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // In simulation mode, getSettingsStatus returns mock data that says "isConfigured: true"
        const data = await getSettingsStatus();
        setProviders(data);
      } catch (error) {
        // Fallback just in case
        setProviders([{
            provider_name: 'gemini',
            api_key_env_var_name: 'API_KEY',
            is_active: true,
            priority: 1,
            isConfigured: true
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Check if at least one provider is configured (or assume true in fallback)
  const isConfigured = providers.length > 0 ? providers.some(p => p.isConfigured) : true;

  const value = {
    providers,
    isConfigured,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
