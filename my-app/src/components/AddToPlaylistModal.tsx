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
import { Playlist, Song } from '../types';

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  song: Song | null;
  onSuccess: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ visible, onClose, song, onSuccess }) => {
  const { playlists, loadPlaylists, createPlaylist, addSongToPlaylist } = usePlaylistStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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
    if (!song) return;
    await addSongToPlaylist(playlist.id, song);
    Alert.alert('Success', 'Song added to playlist');
    onClose();
    onSuccess(); // Triggers navigation in parent
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.headerTitle}>Add to Playlist</Text>

              {isCreating ? (
                <View style={styles.createContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Playlist Name"
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
                  <TouchableOpacity style={styles.newPlaylistBtn} onPress={() => setIsCreating(true)}>
                    <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
                    <Text style={styles.newPlaylistText}>New Playlist</Text>
                  </TouchableOpacity>

                  <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.playlistItem} onPress={() => handleAddToPlaylist(item)}>
                        <Ionicons name="musical-notes-outline" size={24} color="#555" />
                        <View style={styles.playlistInfo}>
                          <Text style={styles.playlistName}>{item.name}</Text>
                          <Text style={styles.playlistCount}>{item.songs.length} songs</Text>
                        </View>
                      </TouchableOpacity>
                    )}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    color: '#1A1A1A',
  },
  playlistCount: {
    fontSize: 12,
    color: '#888',
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
    borderColor: '#ddd',
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
