import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  currentScreen: string;
  navigate: (screenName: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenStack, setScreenStack] = useState<string[]>(['Home']);

  const navigate = (screenName: string) => {
    setScreenStack([...screenStack, screenName]);
  };

  const goBack = () => {
    if (screenStack.length > 1) {
      setScreenStack(screenStack.slice(0, -1));
    }
  };

  const currentScreen = screenStack[screenStack.length - 1];

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
