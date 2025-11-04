const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const saveApiKey = (key: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (e) {
    console.error("Failed to save API key to localStorage", e);
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to get API key from localStorage", e);
    return null;
  }
};

export const clearApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear API key from localStorage", e);
  }
};
