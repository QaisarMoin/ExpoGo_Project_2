import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongCard } from '../components/SongCard';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';

export const FavoritesScreen = () => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        // Empty State
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubText}>Like songs to see them here</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
});
