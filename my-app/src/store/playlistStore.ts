import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Artist, Song } from '../types';

const PLAYLISTS_KEY = '@music_player_playlists';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  artists?: Artist[];
  createdAt: number;
}

interface PlaylistState {
  playlists: Playlist[];
  isLoading: boolean;
  createPlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  addArtistToPlaylist: (playlistId: string, artist: Artist) => Promise<void>;
  removeArtistFromPlaylist: (playlistId: string, artistId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  loadPlaylists: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  isLoading: true,

  loadPlaylists: async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYLISTS_KEY);
      if (stored) {
        set({ playlists: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load playlists', e);
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name: string) => {
    const { playlists } = get();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      artists: [],
      createdAt: Date.now(),
    };
    const newPlaylists = [...playlists, newPlaylist];
    set({ playlists: newPlaylists });
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  },

  addSongToPlaylist: async (playlistId: string, song: Song) => {
    const { playlists } = get();
    const newPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        // avoid duplicates
        if (!p.songs.some(s => s.id === song.id)) {
          return { ...p, songs: [...p.songs, song] };
        }
      }
      return p;
    });
    set({ playlists: newPlaylists });
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
      const { playlists } = get();
      const newPlaylists = playlists.map((p) => {
        if (p.id === playlistId) {
            return { ...p, songs: p.songs.filter(s => s.id !== songId) };
        }
        return p;
      });
      set({ playlists: newPlaylists });
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  },

  addArtistToPlaylist: async (playlistId: string, artist: Artist) => {
    const { playlists } = get();
    const newPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        const currentArtists = p.artists || [];
        if (!currentArtists.some(a => a.id === artist.id)) {
          return { ...p, artists: [...currentArtists, artist] };
        }
      }
      return p;
    });
    set({ playlists: newPlaylists });
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  },

  removeArtistFromPlaylist: async (playlistId: string, artistId: string) => {
    const { playlists } = get();
    const newPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, artists: (p.artists || []).filter(a => a.id !== artistId) };
      }
      return p;
    });
    set({ playlists: newPlaylists });
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  },

  deletePlaylist: async (playlistId: string) => {
    const { playlists } = get();
    const newPlaylists = playlists.filter(p => p.id !== playlistId);
    set({ playlists: newPlaylists });
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
  }
}));
