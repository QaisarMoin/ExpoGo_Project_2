import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getBestImage } from '../services/api';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types';
import { formatDuration, getArtistName } from '../utils/helpers';
import { SongOptionsModal } from './SongOptionsModal';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isPlaying?: boolean;
  isActive?: boolean;
  showIndex?: boolean;
  index?: number;
  playlistId?: string; // Optional: To indicate this song card is viewed inside a specific playlist
  isDarkMode?: boolean;
}

export const SongCard = React.memo<SongCardProps>(({
  song,
  onPlay,
  isPlaying = false,
  isActive = false,
  showIndex = false,
  index,
  playlistId,
  isDarkMode = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const imageUrl = getBestImage(song.image);
  const artist = getArtistName(song);
  const duration = formatDuration(song.duration);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(song.id);

  // Check queue status
  const queue = usePlayerStore(state => state.queue);
  const currentIndex = usePlayerStore(state => state.currentIndex);
  
  const isCurrentlyPlaying = queue[currentIndex]?.id === song.id;
  const isPlayNext = queue.length > 0 && currentIndex + 1 < queue.length && queue[currentIndex + 1]?.id === song.id;

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: bgColor },
      isActive && styles.activeContainer,
      isCurrentlyPlaying && (isDarkMode ? styles.playingContainerDark : styles.playingContainer),
      isPlayNext && (isDarkMode ? styles.playNextContainerDark : styles.playNextContainer),
    ]}>
        <TouchableOpacity 
            style={styles.mainClick} 
            onPress={() => onPlay(song)}
            activeOpacity={0.7}
        >
            <View style={styles.leftSection}>
                {showIndex && !isActive ? (
                <Text style={styles.index}>{(index ?? 0) + 1}</Text>
                ) : null}
                <View style={styles.imageWrapper}>
                <Image 
                    source={{ uri: imageUrl || 'https://via.placeholder.com/50' }} 
                    style={styles.image} 
                />
                </View>
                <View style={styles.info}>
                <Text style={[styles.name, { color: textColor }, isActive && styles.activeName]} numberOfLines={1}>
                    {song.name}
                </Text>
                <Text style={[styles.artist, { color: subTextColor }]} numberOfLines={1}>
                    {artist} | {duration} mins
                </Text>
                </View>
            </View>
        </TouchableOpacity>

        <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => toggleFavorite(song)} style={styles.iconBtn}>
                <Ionicons name={favorite ? "heart" : "heart-outline"} size={22} color={favorite ? "#FF6B35" : "#888"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
        </View>

        <SongOptionsModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          song={song} 
          playlistId={playlistId}
        />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeContainer: {
    backgroundColor: '#FFF5F1',
  },
  playingContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)', // Light orange transparent
  },
  playingContainerDark: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)', // Slightly more visible on dark
  },
  playNextContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green transparent
  },
  playNextContainerDark: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)', 
  },
  mainClick: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  index: {
    width: 24,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginRight: 8,
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeName: {
    color: '#FF6B35',
  },
  artist: {
    fontSize: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
      padding: 6,
  },
  moreBtn: {
    padding: 6,
  },
});
