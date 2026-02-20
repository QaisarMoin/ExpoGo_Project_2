import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore } from '../store/themeStore';
import { Artist, Playlist, Song } from '../types';

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  song?: Song | null;
  artist?: Artist | null;
  itemType: 'song' | 'artist';
  onSuccess: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ 
  visible, 
  onClose, 
  song, 
  artist,
  itemType,
  onSuccess 
}) => {
  const { playlists, loadPlaylists, createPlaylist, addSongToPlaylist, addArtistToPlaylist } = usePlaylistStore();
  const { isDarkMode } = useThemeStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';
  const borderColor = isDarkMode ? '#333' : '#eee';
  const inputBorder = isDarkMode ? '#444' : '#ddd';

  useEffect(() => {
    if (visible) {
      loadPlaylists();
      setIsCreating(false);
      setNewPlaylistName('');
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (itemType === 'song' && song) {
      await addSongToPlaylist(playlist.id, song);
      Alert.alert('Success', 'Song added to playlist');
    } else if (itemType === 'artist' && artist) {
      await addArtistToPlaylist(playlist.id, artist);
      Alert.alert('Success', 'Artist added to playlist');
    } else {
      return;
    }
    
    onClose();
    onSuccess(); // Triggers navigation in parent
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: bgColor }]}>
              <Text style={[styles.headerTitle, { color: textColor }]}>Add to Playlist</Text>

              {isCreating ? (
                <View style={styles.createContainer}>
                  <TextInput
                    style={[styles.input, { borderColor: inputBorder, color: textColor }]}
                    placeholder="Playlist Name"
                    placeholderTextColor={subTextColor}
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                    autoFocus
                  />
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.btnCancel}>
                      <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCreate} style={styles.btnCreate}>
                      <Text style={styles.btnCreateText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={[styles.newPlaylistBtn, { borderBottomColor: borderColor }]} onPress={() => setIsCreating(true)}>
                    <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
                    <Text style={styles.newPlaylistText}>New Playlist</Text>
                  </TouchableOpacity>

                  <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    renderItem={({ item }) => {
                      const isAlreadyAdded = itemType === 'song' 
                        ? (song ? item.songs.some(s => s.id === song.id) : false)
                        : (artist ? (item.artists || []).some(a => a.id === artist.id) : false);
                      
                      return (
                        <TouchableOpacity 
                          style={[styles.playlistItem, isAlreadyAdded && styles.playlistItemDisabled]} 
                          onPress={() => !isAlreadyAdded && handleAddToPlaylist(item)}
                          activeOpacity={isAlreadyAdded ? 1 : 0.7}
                        >
                          <Ionicons 
                            name="musical-notes-outline" 
                            size={24} 
                            color={isAlreadyAdded ? (isDarkMode ? "#555" : "#ccc") : (isDarkMode ? "#aaa" : "#555")} 
                          />
                          <View style={styles.playlistInfo}>
                            <Text style={[styles.playlistName, { color: textColor }, isAlreadyAdded && styles.textDisabled]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.playlistCount, { color: subTextColor }]}>
                              {item.songs.length} songs{item.artists?.length ? `, ${item.artists.length} artists` : ''}
                            </Text>
                          </View>
                          {isAlreadyAdded && (
                            <Ionicons name="checkmark-circle" size={20} color="#FF6B35" style={{ marginLeft: 'auto' }} />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
                    }
                  />
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  newPlaylistText: {
    fontSize: 16,
    color: '#FF6B35',
    marginLeft: 12,
    fontWeight: '600',
  },
  list: {
    marginTop: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playlistInfo: {
    marginLeft: 12,
  },
  playlistName: {
    fontSize: 16,
  },
  playlistItemDisabled: {
    opacity: 0.7,
  },
  textDisabled: {
    color: '#999',
  },
  playlistCount: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  },
  createContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnCancel: {
    padding: 10,
  },
  btnCancelText: {
    color: '#888',
    fontSize: 16,
  },
  btnCreate: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
