import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBestImage } from '../services/api';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onPress: (album: Album) => void;
  isDarkMode?: boolean;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onPress, isDarkMode = false }) => {
  const imageUrl = getBestImage(album.image);
  
  // Format artist name (sometimes it's a string, sometimes array)
  const artistName = Array.isArray(album.primaryArtists) 
      ? album.primaryArtists.map((a: any) => a.name).join(', ')
      : album.primaryArtists || 'Unknown Artist';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          shadowColor: isDarkMode ? 'transparent' : '#000', 
        }
      ]} 
      onPress={() => onPress(album)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: isDarkMode ? '#ffffff' : '#1A1A1A' }]} numberOfLines={1}>{album.name}</Text>
        <Text style={[styles.artist, { color: isDarkMode ? '#aaaaaa' : '#666' }]} numberOfLines={1}>
          {artistName} {album.year ? `• ${album.year}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
  },
});
