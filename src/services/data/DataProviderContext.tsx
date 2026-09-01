import React, { createContext, useContext, useState, useMemo } from 'react';
import { IDataProvider } from './IDataProvider';
import { RealDataProvider } from './RealDataProvider';
import { DemoDataProvider } from './DemoDataProvider';

interface DataProviderContextType {
  dataProvider: IDataProvider;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

const DataProviderContext = createContext<DataProviderContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'
  );

  const realProvider = useMemo(() => new RealDataProvider(), []);
  const demoProvider = useMemo(() => new DemoDataProvider(), []);

  const dataProvider = useMemo(() => {
    return isDemoMode ? demoProvider : realProvider;
  }, [isDemoMode, demoProvider, realProvider]);

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);

  return (
    <DataProviderContext.Provider
      value={{
        dataProvider,
        isDemoMode,
        setDemoMode: setIsDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </DataProviderContext.Provider>
  );
};

export const useDataProvider = (): DataProviderContextType => {
  const context = useContext(DataProviderContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};
