import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArtistCard } from '../components/ArtistCard';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { RootStackParamList } from '../types';

type PlaylistDetailsRouteProp = RouteProp<RootStackParamList, 'PlaylistDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PlaylistDetailsScreen = () => {
  const route = useRoute<PlaylistDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { playlistId } = route.params;
  
  const { playlists } = usePlaylistStore();
  const playlist = playlists.find(p => p.id === playlistId);
  const playSong = usePlayerStore(state => state.playSong);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Playlist Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlaySong = (song: any) => {
    playSong(song, playlist.songs);
  };

  const handleArtistPress = (artistId: string) => {
    navigation.navigate('ArtistDetails', { artistId });
  };

  const hasSongs = playlist.songs.length > 0;
  const hasArtists = playlist.artists && playlist.artists.length > 0;

  // Create unified data array for FlatList if you want a single scroll view, 
  // or render them in sections. We'll render artists first, then songs using a custom data array.
  const listData = [
    ...(playlist.artists || []).map(a => ({ type: 'artist' as const, data: a })),
    ...playlist.songs.map((s, index) => ({ type: 'song' as const, data: s, originalIndex: index }))
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="musical-notes" size={48} color="#FF6B35" />
        </View>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.playlistCount}>
          {playlist.songs.length} songs{playlist.artists?.length ? `, ${playlist.artists.length} artists` : ''}
        </Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.type === 'song' ? `song-${item.data.id}` : `artist-${item.data.id}`}
        renderItem={({ item }) => {
          if (item.type === 'artist') {
            return (
              <ArtistCard
                artist={item.data}
                onPress={() => handleArtistPress(item.data.id)}
                playlistId={playlist.id}
              />
            );
          } else {
            return (
              <SongCard
                song={item.data}
                onPlay={handlePlaySong}
                showIndex={true}
                index={item.originalIndex}
                playlistId={playlist.id}
              />
            );
          }
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Playlist is empty</Text>
            <Text style={styles.emptySubText}>Add songs or artists to this playlist to see them here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  playlistCount: {
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    paddingBottom: 100, // Space for mini player
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});
