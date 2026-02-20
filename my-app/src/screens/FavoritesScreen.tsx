import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongCard } from '../components/SongCard';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';

export const FavoritesScreen = () => {
  const { isDarkMode } = useThemeStore();
  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';
  const borderColor = isDarkMode ? '#333' : '#f0f0f0';

  const { favorites, loadFavorites } = useFavoritesStore();
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Handle playing a song from the favorites list
  // Replaces current queue with the favorites list
  const handlePlay = (song: any) => {
    playSong(song, favorites);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={bgColor} />
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        // Empty State
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={subTextColor} />
          <Text style={[styles.emptyText, { color: textColor }]}>No favorites yet</Text>
          <Text style={[styles.emptySubText, { color: subTextColor }]}>Like songs to see them here</Text>
        </View>
      ) : (
        // List of Favorite Songs
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SongCard
              song={item}
              onPlay={handlePlay}
              isActive={currentSong?.id === item.id}
              isPlaying={currentSong?.id === item.id && isPlaying}
              showIndex
              index={index}
              isDarkMode={isDarkMode}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
  },
});
