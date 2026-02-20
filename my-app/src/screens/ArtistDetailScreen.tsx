import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongCard } from '../components/SongCard';
import { getArtistDetails, getArtistSongs, getBestImage, searchSongs } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { Artist, RootStackParamList, Song } from '../types';

type ArtistDetailRouteProp = RouteProp<RootStackParamList, 'ArtistDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ArtistDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ArtistDetailRouteProp>();
  const { artistId, initialArtist } = route.params;
  const { playSong, playNext } = usePlayerStore();
  const { isDarkMode } = useThemeStore();

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#aaa' : '#888';

  const [artist, setArtist] = useState<Artist | null>(initialArtist || null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [details, setDetails] = useState<any>(null); // For extra stats like followerCount
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  
  // Optimization: Stable Ref for songs to avoid re-creating handlePlay on every render
  const songsRef = useRef<Song[]>([]); 
  useEffect(() => { songsRef.current = songs; }, [songs]);

  // Optimization: Stable Play Handler using Ref
  const handlePlaySong = useCallback((song: Song) => {
      playSong(song, songsRef.current);
  }, [playSong]);

  useEffect(() => {
    loadData();
  }, [artistId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let detailsRes = null;
      try {
         detailsRes = await getArtistDetails(artistId);
      } catch (e) {
         console.warn('Failed to load details', e);
      }

      // Update details if successful
      if (detailsRes) {
          setDetails(detailsRes);
          // Update artist info if missing (e.g. from deep link)
          if (!artist) {
             setArtist({
                 id: detailsRes.id,
                 name: detailsRes.name,
                 role: 'Artist',
                 image: detailsRes.image,
                 type: 'artist',
                 url: detailsRes.url
             });
          }
      }

      // Always fetch songs, even if details failed
      try {
          const songsRes = await getArtistSongs(artistId, 1);
          if (songsRes?.songs && songsRes.songs.length > 0) {
            setSongs(songsRes.songs);
            setTotalSongs(songsRes.total);
            setHasMore(songsRes.songs.length === 20 && songsRes.total > 20);
          } else {
             throw new Error('No songs found by ID');
          }
      } catch (e) {
          console.warn('Failed to load songs by ID, trying fallback search...', e);
          // Fallback: Search by Artist Name (for Foreign Artists where ID might fail)
          if (artist?.name) {
              setIsFallback(true);
              try {
                  const fallbackRes = await searchSongs(artist.name, 1, 20);
                  if (fallbackRes?.songs && fallbackRes.songs.length > 0) {
                      setSongs(fallbackRes.songs);
                      setTotalSongs(fallbackRes.total);
                      setHasMore(fallbackRes.songs.length === 20);
                  }
              } catch (err) {
                  console.error('Fallback search failed', err);
              }
          }
      }
    } catch (e) {
      console.error('Failed to load artist data', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSongs = async () => {
      if (loadingMore || !hasMore) return;

      setLoadingMore(true);
      try {
          const nextPage = page + 1;
          let newSongs: Song[] = [];
          
          if (isFallback) {
              // Fallback pagination
              if (artist?.name) {
                  const res = await searchSongs(artist.name, nextPage, 20);
                  newSongs = res.songs;
              }
          } else {
              // Normal pagination
              const res = await getArtistSongs(artistId, nextPage);
              newSongs = res.songs;
          }

          if (newSongs.length > 0) {
              setSongs(prev => {
                  const filtered = newSongs.filter(n => !prev.some(p => p.id === n.id));
                  return [...prev, ...filtered];
              });
              setPage(nextPage);
              // Simple check for end of list: if we got less than requested (usually 10 or 20), we reached the end.
              // Taking a safer approach: as long as we got SOME songs, we might have more.
              setHasMore(newSongs.length > 0);
          } else {
              setHasMore(false);
          }
      } catch(e) {
          console.error("Failed to load more songs", e);
          setHasMore(false);
      } finally {
          setLoadingMore(false);
      }
  };

  const handlePlayAll = () => {
      if (songs.length > 0) {
          playSong(songs[0], songs);
      }
  };

  const handleShuffle = () => {
      if (songs.length > 0) {
          const shuffled = [...songs].sort(() => Math.random() - 0.5);
          playSong(shuffled[0], shuffled);
      }
  };

  const renderHeader = () => {
      if (!artist) return null;
      const imageUrl = getBestImage(artist.image || details?.image);
      const songCount = totalSongs || details?.songs?.length || 0;
      const albumCount = details?.albumCount || 0; // API might not give this
      
      const totalDurationSec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
      const hours = Math.floor(totalDurationSec / 3600);
      const minutes = Math.floor((totalDurationSec % 3600) / 60);
      const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
      
      return (
          <View style={styles.header}>
              <View style={styles.navBar}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                      <Ionicons name="arrow-back" size={24} color={textColor} />
                  </TouchableOpacity>
              </View>
              
              <View style={styles.profileSection}>
                  <Image source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} style={styles.largeImage} />
                  <Text style={[styles.name, { color: textColor }]}>{artist.name}</Text>
                  <Text style={[styles.stats, { color: subTextColor }]}>
                      {songCount > 0 ? (
                          <>
                           {albumCount > 0 ? `${albumCount} Albums | ` : ''}
                           {songCount} Songs {totalDurationSec > 0 ? `| ${durationText}` : ''}
                          </>
                      ) : (
                          'Artist'
                      )}
                  </Text>
              </View>

              <View style={styles.buttonsRow}>
                  <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle}>
                      <Ionicons name="shuffle" size={20} color="#fff" style={{marginRight: 8}} />
                      <Text style={styles.shuffleText}>Shuffle</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.playBtn} onPress={handlePlayAll}>
                      <Ionicons name="play" size={20} color="#FF6B35" style={{marginRight: 8}} />
                      <Text style={styles.playText}>Play</Text>
                  </TouchableOpacity>
              </View>
          </View>
      );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {loading && !artist ? (
          <View style={styles.center}>
              <ActivityIndicator color="#FF6B35" size="large" />
          </View>
      ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
                <SongCard 
                    song={item} 
                    onPlay={handlePlaySong} // Stable callback
                    // isActive={currentSong?.id === item.id} // Optional: Enable if needed (minor perf cost)
                    isDarkMode={isDarkMode}
                />
            )}
            onEndReached={() => {
                if (hasMore && !loadingMore) {
                    loadMoreSongs();
                }
            }}
            onEndReachedThreshold={0.5}
            // 🔥 PERFORMANCE PROPS
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={11} // Recommended default is 21, 11 is a good balance
            removeClippedSubviews={true} 
            updateCellsBatchingPeriod={50}
            getItemLayout={(data, index) => (
                {length: 74, offset: 74 * index, index} // Fixed height optimization (approx 74 based on SongCard + padding)
            )}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#FF6B35" style={{margin: 20}} /> : null}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  header: {
      alignItems: 'center',
      paddingBottom: 24,
      paddingHorizontal: 20,
  },
  navBar: {
      width: '100%',
      alignItems: 'flex-start',
      marginBottom: 10,
  },
  backBtn: {
      padding: 8,
      marginLeft: -8,
  },
  profileSection: {
      alignItems: 'center',
      marginBottom: 24,
  },
  largeImage: {
      width: 180,
      height: 180,
      borderRadius: 90,
      marginBottom: 16,
      backgroundColor: '#f0f0f0',
  },
  name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
  },
  stats: {
      fontSize: 14,
  },
  buttonsRow: {
      flexDirection: 'row',
      gap: 16,
      width: '100%',
      justifyContent: 'center',
  },
  shuffleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF6B35',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 24,
      minWidth: 140,
      justifyContent: 'center',
  },
  shuffleText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
  },
  playBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF0E8',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 24,
      minWidth: 140,
      justifyContent: 'center',
  },
  playText: {
      color: '#FF6B35',
      fontWeight: '600',
      fontSize: 16,
  },
  listContent: {
      paddingBottom: 120,
      flexGrow: 1,
  },
});
