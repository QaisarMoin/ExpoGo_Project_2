import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const THEME_KEY = '@music_player_theme';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: true, // Defaulting to dark mode for a music app is common
  
  toggleTheme: () => {
    const newTheme = !get().isDarkMode;
    set({ isDarkMode: newTheme });
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        set({ isDarkMode: JSON.parse(savedTheme) });
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  }
}));
