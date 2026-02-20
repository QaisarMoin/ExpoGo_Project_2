import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { getBestImage } from '../services/api';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { MainTabParamList, RootStackParamList, Song } from '../types';
import { formatDuration, getArtistName } from '../utils/helpers';
import { AddToPlaylistModal } from './AddToPlaylistModal';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const { height } = Dimensions.get('window');

interface SongOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  song: Song;
  playlistId?: string;
}

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({ visible, onClose, song, playlistId }) => {
  const imageUrl = getBestImage(song.image) || 'https://via.placeholder.com/50';
  const artist = getArtistName(song);
  const duration = formatDuration(song.duration);
  
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(song.id);
  const enqueueNext = usePlayerStore((state) => state.enqueueNext);
  const { removeSongFromPlaylist } = usePlaylistStore();
  const navigation = useNavigation<NavigationProp>();
  const [playlistModalVisible, setPlaylistModalVisible] = React.useState(false);

  const handlePlayNext = () => {
    enqueueNext(song);
    onClose();
  };

  const handleAddToPlaylist = () => {
    setPlaylistModalVisible(true);
  };

  const handlePlaylistSuccess = () => {
    navigation.navigate('MainTabs', { screen: 'Playlists' } as any);
    onClose();
  };

  const handleGoToAlbum = () => {
    if (song.album?.id) {
      navigation.navigate('AlbumDetails', { albumId: song.album.id });
    } else {
      console.log('No album ID found for this song');
    }
    onClose();
  };

  const handleRemoveFromPlaylist = async () => {
    if (playlistId) {
      await removeSongFromPlaylist(playlistId, song.id);
      onClose();
    }
  };

  const baseOptions = [
    { icon: 'arrow-forward-circle-outline', label: 'Play Next', onPress: handlePlayNext },
    { icon: 'document-text-outline', label: 'Add to Playing Queue', onPress: onClose },
    { icon: 'add-circle-outline', label: 'Add to Playlist', onPress: handleAddToPlaylist },
    { icon: 'disc-outline', label: 'Go to Album', onPress: handleGoToAlbum },
    { icon: 'person-outline', label: 'Go to Artist', onPress: onClose },
    { icon: 'information-circle-outline', label: 'Details', onPress: onClose },
    { icon: 'call-outline', label: 'Set as Ringtone', onPress: onClose },
    { icon: 'close-circle-outline', label: 'Add to Blacklist', onPress: onClose },
    { icon: 'paper-plane-outline', label: 'Share', onPress: onClose },
    { icon: 'trash-outline', label: 'Delete from Device', onPress: onClose },
  ];

  const options = playlistId 
    ? [{ icon: 'trash-outline', label: 'Remove from Playlist', onPress: handleRemoveFromPlaylist }, ...baseOptions]
    : baseOptions;

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
            <View style={styles.modalContainer}>
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
              
              <View style={styles.header}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={styles.headerInfo}>
                  <Text style={styles.title} numberOfLines={1}>{song.name}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {artist}  |  {duration} mins
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(song)} style={styles.favoriteBtn}>
                  <Ionicons 
                    name={favorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color={favorite ? "#FF6B35" : "#333"} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
                {options.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.optionRow} onPress={item.onPress}>
                    <Ionicons name={item.icon as any} size={22} color={item.label === 'Go to Album' && !song.album?.id ? '#ccc' : '#333'} style={styles.optionIcon} />
                    <Text style={[styles.optionLabel, item.label === 'Go to Album' && !song.album?.id ? { color: '#ccc' } : {}]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      
      <AddToPlaylistModal
        visible={playlistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        song={song}
        itemType="song"
        onSuccess={handlePlaylistSuccess}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: height * 0.8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  favoriteBtn: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
