import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db';

interface AuthContextType {
  isAuthenticated: boolean;
  unlockApp: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  pinCode: string;
  updatePinCode: (newPin: string) => Promise<void>;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours in ms

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initial check: Require PIN unless valid recent session exists
    const isAuth = localStorage.getItem('hanut_authenticated') === 'true';
    const savedLastAct = localStorage.getItem('hanut_last_activity');
    if (isAuth && savedLastAct) {
      const timePassed = Date.now() - parseInt(savedLastAct, 10);
      if (timePassed < INACTIVITY_TIMEOUT) {
        return true; // Valid active session within 12 hours
      }
    }
    return false; // Require PIN by default on open
  });

  const [pinCode, setPinCode] = useState<string>('1234');

  useEffect(() => {
    // Load stored PIN from database
    db.settings.get('pin_code').then((setting) => {
      if (setting && setting.value) {
        setPinCode(setting.value);
      }
    });
  }, []);

  const updateActivity = () => {
    const now = Date.now();
    localStorage.setItem('hanut_last_activity', now.toString());
  };

  // Listen to user interactions to refresh inactivity timer
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isAuthenticated) {
        updateActivity();
      }
    };

    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isAuthenticated]);

  const unlockApp = async (inputPin: string): Promise<boolean> => {
    const setting = await db.settings.get('pin_code');
    const currentPin = setting ? setting.value : '1234';

    if (inputPin === currentPin) {
      setIsAuthenticated(true);
      localStorage.setItem('hanut_authenticated', 'true');
      updateActivity();
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hanut_authenticated');
  };

  const updatePinCode = async (newPin: string) => {
    await db.settings.put({ key: 'pin_code', value: newPin });
    setPinCode(newPin);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, unlockApp, lockApp, pinCode, updatePinCode, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
