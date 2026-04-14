import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  currentUser: string | null;
  setCurrentUser: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'fillup_current_user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setCurrentUser = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setCurrentUserState(name);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUserState(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
