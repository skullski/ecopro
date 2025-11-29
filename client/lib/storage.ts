/**
 * Safe localStorage/sessionStorage wrapper with quota handling
 */

export const safeStorage = {
  setItem: (key: string, value: string, useSession = false): boolean => {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old data...');
        try {
          // Clear storage and retry
          const storage = useSession ? sessionStorage : localStorage;
          storage.clear();
          storage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Failed to set storage even after clearing:', retryError);
          return false;
        }
      }
      console.error('Storage error:', error);
      return false;
    }
  },

  getItem: (key: string, useSession = false): string | null => {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      return storage.getItem(key);
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  },

  removeItem: (key: string, useSession = false): void => {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (useSession = false): void => {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};
