import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import { usePlaylistStore } from '../store/playlistStore';
import { Artist, MainTabParamList, RootStackParamList } from '../types';
import { AddToPlaylistModal } from './AddToPlaylistModal';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const { height } = Dimensions.get('window');

interface ArtistOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  artist: Artist;
  playlistId?: string;
}

export const ArtistOptionsModal: React.FC<ArtistOptionsModalProps> = ({ visible, onClose, artist, playlistId }) => {
  const imageUrl = getBestImage(artist.image) || 'https://via.placeholder.com/60';
  const { removeArtistFromPlaylist } = usePlaylistStore();
  const navigation = useNavigation<NavigationProp>();
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);

  const handleAddToPlaylist = () => {
    setPlaylistModalVisible(true);
  };

  const handlePlaylistSuccess = () => {
    navigation.navigate('MainTabs'); 
    navigation.navigate('Playlists' as any);
    onClose();
  };

  const handleRemoveFromPlaylist = async () => {
    if (playlistId) {
      await removeArtistFromPlaylist(playlistId, artist.id);
      onClose();
    }
  };

  const baseOptions = [
    { icon: 'add-circle-outline', label: 'Add to Playlist', onPress: handleAddToPlaylist },
    { icon: 'information-circle-outline', label: 'Details', onPress: onClose },
    { icon: 'share-social-outline', label: 'Share', onPress: onClose },
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
                  <Text style={styles.title} numberOfLines={1}>{artist.name}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>Artist</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
                {options.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.optionRow} onPress={item.onPress}>
                    <Ionicons name={item.icon as any} size={22} color="#333" style={styles.optionIcon} />
                    <Text style={styles.optionLabel}>{item.label}</Text>
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
        artist={artist}
        itemType="artist"
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
    borderRadius: 30, // Circular for artist
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
