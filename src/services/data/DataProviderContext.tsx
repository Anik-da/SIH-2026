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
  // Permanently locked to Real Spatial Data Engine only
  const isDemoMode = false;
  const realProvider = useMemo(() => new RealDataProvider(), []);
  const dataProvider = realProvider;

  const toggleDemoMode = () => {
    console.info('[DataProvider] Running in strict Real Spatial Data Engine mode.');
  };

  return (
    <DataProviderContext.Provider
      value={{
        dataProvider,
        isDemoMode: false,
        setDemoMode: () => {},
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
