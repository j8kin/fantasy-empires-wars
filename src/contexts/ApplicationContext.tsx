import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextType {
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
}

const ApplicationContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <ApplicationContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
