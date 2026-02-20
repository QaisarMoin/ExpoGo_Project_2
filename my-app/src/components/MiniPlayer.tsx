import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBestImage } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { RootStackParamList } from '../types';
import { getArtistName } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentSong, isPlaying, togglePlayPause, clearPlayer } = usePlayerStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (currentSong) {
      checkTooltip();
    }
  }, [currentSong]);

  const checkTooltip = () => {
    try {
      if (!showTooltip) { // Just basic check
        setShowTooltip(true);
        
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Hide after 5 seconds
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setShowTooltip(false));
        }, 5000);
      }
    } catch (e) {
      console.log('Tooltip error', e);
    }
  };

  if (!currentSong) return null;

  const imageUrl = getBestImage(currentSong.image);
  const artist = getArtistName(currentSong);

  const handleLongPress = () => {
    Alert.alert(
      'Remove MiniPlayer',
      'Are you sure you want to clear the player?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: clearPlayer },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      onLongPress={handleLongPress}
      activeOpacity={0.95}
    >
      <View style={styles.content}>
        {/* Artwork */}
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="musical-note" size={18} color="#FF6B35" />
            </View>
          )}
        </View>

        {/* Song Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress indicator (thin line) */}
      <View style={styles.progressBar} />

      {/* Floating Tooltip */}
      {showTooltip && (
        <Animated.View style={[styles.tooltipContainer, { opacity: fadeAnim }]}>
          <View style={styles.tooltipArrow} />
          <View style={styles.tooltipContent}>
            <Ionicons name="information-circle" size={16} color="#fff" style={styles.tooltipIcon} />
            <Text style={styles.tooltipText}>Long press to remove player</Text>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: '#aaa',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#FF6B35',
    width: '40%',
  },
  tooltipContainer: {
    position: 'absolute',
    top: -45, // Hover above the MiniPlayer
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.85)',
    position: 'absolute',
    bottom: -8,
  },
  tooltipContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipIcon: {
    marginRight: 6,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
