import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';
import { getBestImage, getBestDownloadUrl } from '../services/api';
import { getArtistName, formatDuration } from '../utils/helpers';

import { useFavoritesStore } from '../store/favoritesStore';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isPlaying?: boolean;
  isActive?: boolean;
  showIndex?: boolean;
  index?: number;
}

export const SongCard = React.memo<SongCardProps>(({
  song,
  onPlay,
  isPlaying = false,
  isActive = false,
  showIndex = false,
  index,
}) => {
  const imageUrl = getBestImage(song.image);
  const artist = getArtistName(song);
  const duration = formatDuration(song.duration);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(song.id);

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
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
                <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>
                    {song.name}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {artist} | {duration} mins
                </Text>
                </View>
            </View>
        </TouchableOpacity>

        <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => toggleFavorite(song)} style={styles.iconBtn}>
                <Ionicons name={favorite ? "heart" : "heart-outline"} size={22} color={favorite ? "#FF6B35" : "#888"} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
        </View>
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
    backgroundColor: '#fff',
  },
  activeContainer: {
    backgroundColor: '#FFF5F1',
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
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activeName: {
    color: '#FF6B35',
  },
  artist: {
    fontSize: 12,
    color: '#888',
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
