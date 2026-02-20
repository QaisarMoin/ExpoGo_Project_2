import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { getBestImage, searchSongs } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { Artist, Song } from '../types';

interface ArtistBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  artist: Artist | null;
}

export const ArtistBottomSheet: React.FC<ArtistBottomSheetProps> = ({
  visible,
  onClose,
  artist,
}) => {
  const { playSong, addToQueue, enqueueNext } = usePlayerStore();
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [topSongs, setTopSongs] = useState<Song[]>([]);

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';
  const dragHandleColor = isDarkMode ? '#444' : '#E0E0E0';
  const iconColor = isDarkMode ? '#fff' : '#1A1A1A';

  useEffect(() => {
    if (visible && artist) {
      fetchTopSongs();
    } else {
      setTopSongs([]); // Reset on close
    }
  }, [visible, artist]);

  const fetchTopSongs = async () => {
    if (!artist) return;
    setLoading(true);
    try {
      // Search for artist's songs using their name
      const res = await searchSongs(artist.name, 1, 10);
      setTopSongs(res.songs);
    } catch (e) {
      console.log('Failed to load artist songs', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (topSongs.length > 0) {
      await playSong(topSongs[0], topSongs);
      onClose();
    }
  };

  const handlePlayNext = () => {
     // Add to queue after current index
     if (topSongs.length > 0) {
         enqueueNext(topSongs[0]);
         onClose();
     }
  };

  const handleAddToQueue = () => {
    if (topSongs.length > 0) {
        topSongs.forEach(s => addToQueue(s));
        onClose();
    }
  };

  if (!artist) return null;

  const imageUrl = getBestImage(artist.image);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
            <TouchableWithoutFeedback>
                <View style={[styles.sheet, { backgroundColor: bgColor }]}>
                    {/* Handle Bar */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: dragHandleColor }]} />
                    </View>

                    {/* Artist Header */}
                    <View style={styles.header}>
                        <Image source={{ uri: imageUrl || 'https://via.placeholder.com/80' }} style={styles.image} />
                        <View style={styles.headerInfo}>
                            <Text style={[styles.name, { color: textColor }]}>{artist.name}</Text>
                            <Text style={[styles.role, { color: subTextColor }]}>{artist.role} • {topSongs.length} Tracks loaded</Text>
                        </View>
                    </View>

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#FF6B35" />
                            <Text style={[styles.loadingText, { color: subTextColor }]}>Loading top songs...</Text>
                        </View>
                    )}

                    {/* Actions */}
                    {!loading && topSongs.length > 0 && (
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionRow} onPress={handlePlay}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="play" size={24} color="#FF6B35" />
                                </View>
                                <Text style={[styles.actionText, { color: textColor }]}>Play</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={handlePlayNext}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="return-down-forward" size={24} color={iconColor} />
                                </View>
                                <Text style={[styles.actionText, { color: textColor }]}>Play Next</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={handleAddToQueue}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="list" size={24} color={iconColor} />
                                </View>
                                <Text style={[styles.actionText, { color: textColor }]}>Add to Playing Queue</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={() => onClose()}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="add-circle-outline" size={24} color={iconColor} />
                                </View>
                                <Text style={[styles.actionText, { color: textColor }]}>Add to Playlist</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionRow} onPress={onClose}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="share-social" size={24} color={iconColor} />
                                </View>
                                <Text style={[styles.actionText, { color: textColor }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {/* Empty/Error State */}
                    {!loading && topSongs.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: subTextColor }]}>No songs found for this artist.</Text>
                        </View>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    minHeight: 400,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 24,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
      padding: 24,
      alignItems: 'center',
  },
  emptyText: {
  },
});
