import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Route, Consumer, ApiKey } from '../types';

interface AppContextType {
  routes: Route[];
  consumers: Consumer[];
  apiKeys: ApiKey[];
  setRoutes: (routes: Route[]) => void;
  setConsumers: (consumers: Consumer[]) => void;
  setApiKeys: (keys: ApiKey[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        routes,
        consumers,
        apiKeys,
        setRoutes,
        setConsumers,
        setApiKeys,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
