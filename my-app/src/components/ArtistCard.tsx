import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getBestImage } from '../services/api';
import { Artist } from '../types';
import { ArtistOptionsModal } from './ArtistOptionsModal';

interface ArtistCardProps {
  artist: Artist;
  onPress: () => void;
  playlistId?: string; // Add this to allow passing playlistId context
  isDarkMode?: boolean;
}

export const ArtistCard = React.memo<ArtistCardProps>(({
  artist,
  onPress,
  playlistId,
  isDarkMode = false,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const imageUrl = getBestImage(artist.image);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/60' }} 
          style={styles.image} 
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#1A1A1A' }]} numberOfLines={1}>
            {artist.name}
          </Text>
          <Text style={[styles.role, { color: isDarkMode ? '#aaa' : '#888' }]} numberOfLines={1}>
            Artist
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreBtn} onPress={() => setModalVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={20} color="#888" />
      </TouchableOpacity>

      <ArtistOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        artist={artist}
        playlistId={playlistId}
      />
    </TouchableOpacity>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
  },
  moreBtn: {
    padding: 8,
  },
});
