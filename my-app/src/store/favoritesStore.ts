import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const FAVORITES_KEY = '@music_player_favorites';

interface FavoritesState {
  favorites: Song[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (song: Song) => Promise<void>;
  isFavorite: (songId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  loadFavorites: async () => {
    try {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      if (json) {
        set({ favorites: JSON.parse(json) });
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  },

  toggleFavorite: async (song: Song) => {
    const { favorites } = get();
    const exists = favorites.find((s) => s.id === song.id);
    let newFavorites;

    if (exists) {
      newFavorites = favorites.filter((s) => s.id !== song.id);
    } else {
      newFavorites = [...favorites, song];
    }

    set({ favorites: newFavorites });
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  },

  isFavorite: (songId: string) => {
    return get().favorites.some((s) => s.id === songId);
  },
}));
