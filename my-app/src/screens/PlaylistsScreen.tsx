import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore } from '../store/themeStore';
import { Playlist, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PlaylistsScreen = () => {
  const { isDarkMode } = useThemeStore();
  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';
  const borderColor = isDarkMode ? '#333' : '#F0F0F0';
  const itemBorderColor = isDarkMode ? '#333' : '#F5F5F5';
  const iconBg = isDarkMode ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.1)';

  const { playlists, loadPlaylists, deletePlaylist } = usePlaylistStore();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deletePlaylist(id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity 
      style={[styles.playlistItem, { borderBottomColor: itemBorderColor }]}
      onPress={() => navigation.navigate('PlaylistDetails', { playlistId: item.id })}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name="musical-notes" size={24} color="#FF6B35" />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistName, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.playlistCount, { color: subTextColor }]}>
          {item.songs.length} songs{item.artists?.length ? `, ${item.artists.length} artists` : ''}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeletePlaylist(item.id, item.name)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Playlists</Text>
      </View>
      
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={64} color={subTextColor} />
            <Text style={[styles.emptyText, { color: textColor }]}>No playlists yet</Text>
            <Text style={[styles.emptySubText, { color: subTextColor }]}>Add songs to a playlist to see them here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 13,
  },
  deleteBtn: {
    padding: 8,
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
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
