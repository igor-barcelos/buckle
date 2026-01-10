import { createContext, useContext } from 'react';
import { Model } from './Model';

type AppContextType = {
  model: Model;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
export const AppContext = createContext<AppContextType | undefined>(undefined);
export const store = () => useAppContext();
export const useModel = () => useAppContext().model;
