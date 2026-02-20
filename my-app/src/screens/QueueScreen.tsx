import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Alert,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBestImage } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { Song } from '../types';
import { formatDuration, getArtistName } from '../utils/helpers';

export const QueueScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    queue,
    currentSong,
    currentIndex,
    isPlaying,
    playSong,
    removeFromQueue,
    reorderQueue,
  } = usePlayerStore();
  const { isDarkMode } = useThemeStore();

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';
  const borderColor = isDarkMode ? '#333' : '#F5F5F5';
  const activeRowBg = isDarkMode ? '#2A1A14' : '#FFF5F1';

  const handlePlay = async (song: Song, index: number) => {
    await playSong(song, queue);
    navigation.goBack();
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Remove Song',
      `Remove "${queue[index]?.name}" from queue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromQueue(index),
        },
      ]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) reorderQueue(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) reorderQueue(index, index + 1);
  };

  const renderItem = ({ item, index }: { item: Song; index: number }) => {
    const imageUrl = getBestImage(item.image);
    const artist = getArtistName(item);
    const isActive = currentSong?.id === item.id;

    return (
      <View style={[styles.songRow, { backgroundColor: bgColor }, isActive && { backgroundColor: activeRowBg }]}>
        <TouchableOpacity
          style={styles.songLeft}
          onPress={() => handlePlay(item, index)}
          activeOpacity={0.7}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.songImage} />
          ) : (
            <View style={[styles.songImage, styles.imagePlaceholder]}>
              <Ionicons name="musical-note" size={16} color="#FF6B35" />
            </View>
          )}
          <View style={styles.songInfo}>
            <Text style={[styles.songName, { color: textColor }, isActive && styles.activeSongName]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.songArtist, { color: subTextColor }]} numberOfLines={1}>
              {artist} · {formatDuration(item.duration)}
            </Text>
          </View>
          {isActive && (
            <View style={styles.playingIndicator}>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={22}
                color="#FF6B35"
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.songActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMoveUp(index)}
            disabled={index === 0}
          >
            <Ionicons name="chevron-up" size={18} color={index === 0 ? '#ccc' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMoveDown(index)}
            disabled={index === queue.length - 1}
          >
            <Ionicons name="chevron-down" size={18} color={index === queue.length - 1 ? '#ccc' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleRemove(index)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Queue</Text>
          <Text style={[styles.headerCount, { color: subTextColor }]}>{queue.length} songs</Text>
        </View>

        {/* Empty State */}
        {queue.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={72} color="#FF6B35" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>Queue is empty</Text>
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              Play a song to add it to your queue
            </Text>
            <TouchableOpacity
              style={styles.goHomeBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.goHomeText}>Browse Songs</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Queue List */}
        {queue.length > 0 && (
          <FlatList
            data={queue}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: borderColor }]} />}
            contentContainerStyle={[styles.listContent, { paddingBottom: 90 }]}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  headerCount: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 16,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeSongRow: {
  },
  songLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
    paddingRight: 8,
  },
  songName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  activeSongName: {
    color: '#FF6B35',
  },
  songArtist: {
    fontSize: 12,
  },
  playingIndicator: {
    marginRight: 8,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  goHomeBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  goHomeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
