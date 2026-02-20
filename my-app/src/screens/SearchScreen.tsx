
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { SongCard } from '../components/SongCard';
import { searchAlbums, searchArtists, searchSongs } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { Album, Artist, RootStackParamList, Song } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SearchTab = 'Songs' | 'Artists' | 'Albums';

const TABS: SearchTab[] = ['Songs', 'Artists', 'Albums'];

// Static Recent Searches
const RECENT_SEARCHES = [
  'Arijit Singh',
  'Taylor Swift',
  'Relaxing Jazz',
  'Rock Classics',
  'Sidhu Moose Wala',
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { isDarkMode, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('Songs');
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // To show empty state vs initial state

  const handleSearch = async (text: string = query) => {
    const searchTerm = text.trim();
    if (!searchTerm) return;
    
    setQuery(searchTerm); // Update UI if triggered by recent search click
    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);

    try {
        // Fetch ALL tabs data at once to be simple and snappy
        // Or fetch only active tab? User said "When user searches -> Call APIs"
        // Let's fetch all concurrently as per "Switching tabs updates data" without loading requirement implication
        // Actually for performance, let's fetch all 3. It's usually fast enough for 20 items.
        
        const [songRes, artistRes, albumRes] = await Promise.allSettled([
            searchSongs(searchTerm, 1, 20),
            searchArtists(searchTerm, 1, 20),
            searchAlbums(searchTerm, 1, 20)
        ]);

        if (songRes.status === 'fulfilled') setSongs(songRes.value.songs);
        else setSongs([]);

        if (artistRes.status === 'fulfilled') {
            let validArtists = artistRes.value.artists.filter(a => a.image && a.image.length > 0 && a.image[0].url);

            // Prioritize Exact Match
            const lowerQuery = searchTerm.toLowerCase();
            validArtists.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                
                if (aName === lowerQuery && bName !== lowerQuery) return -1;
                if (bName === lowerQuery && aName !== lowerQuery) return 1;
                return 0;
            });

            setArtists(validArtists);
        } else {
            setArtists([]);
        }

        if (albumRes.status === 'fulfilled') setAlbums(albumRes.value.albums);
        else setAlbums([]);

    } catch (e) {
        console.error("Search failed", e);
    } finally {
        setLoading(false);
    }
  };

  const handleRecentClick = (term: string) => {
      setQuery(term);
      handleSearch(term);
  };

  const clearSearch = () => {
      setQuery('');
      setHasSearched(false);
      setSongs([]);
      setArtists([]);
      setAlbums([]);
  };

  const renderContent = () => {
      if (loading) {
          return (
              <View style={styles.center}>
                  <ActivityIndicator size="large" color="#FF6B35" />
              </View>
          );
      }

      if (!hasSearched) {
          // Initial Screen: Recent Searches
          return (
              <View style={styles.recentContainer}>
                  <View style={styles.recentHeader}>
                      <Text style={[styles.recentTitle, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}>Recent Searches</Text>
                  </View>
                  {RECENT_SEARCHES.map((term, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.recentItem, { borderBottomColor: isDarkMode ? '#333' : '#f9f9f9' }]}
                        onPress={() => handleRecentClick(term)}
                      >
                          <Ionicons name="time-outline" size={20} color={isDarkMode ? '#666' : '#888'} />
                          <Text style={[styles.recentText, { color: isDarkMode ? '#eee' : '#444' }]}>{term}</Text>
                          <Ionicons name="arrow-forward-outline" size={16} color={isDarkMode ? '#555' : '#ccc'} style={{marginLeft: 'auto'}} />
                      </TouchableOpacity>
                  ))}
              </View>
          );
      }

      // Results Views
      const isEmpty = (activeTab === 'Songs' && songs.length === 0) ||
                      (activeTab === 'Artists' && artists.length === 0) ||
                      (activeTab === 'Albums' && albums.length === 0);

      if (isEmpty) {
          return (
              <View style={styles.center}>
                  <Image 
                    source={isDarkMode ? require('../../assets/images/black.png') : require('../../assets/images/white.png')} 
                    style={styles.emptyImage} 
                    resizeMode="contain"
                  />
                  <Text style={[styles.emptyTitle, isDarkMode && { color: '#fff' }]}>Not Found</Text>
                  <Text style={styles.emptyText}>Sorry, the keyword you entered cannot be found, please check again or search with another keyword.</Text>
              </View>
          );
      }

      return (
          <View style={{flex: 1}}>
              {activeTab === 'Songs' && (
                  <FlatList
                      data={songs}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                          <SongCard
                              song={item}
                              onPlay={(s) => playSong(s, [s])} // Simple play single song for now
                              isActive={currentSong?.id === item.id}
                              isPlaying={currentSong?.id === item.id && isPlaying}
                          />
                      )}
                      contentContainerStyle={styles.listContent}
                  />
              )}

              {activeTab === 'Artists' && (
                  <FlatList
                      data={artists}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                          <ArtistCard
                              artist={item}
                              onPress={() => navigation.navigate('ArtistDetails', { artistId: item.id, initialArtist: item })}
                          />
                      )}
                      contentContainerStyle={styles.listContent}
                  />
              )}

              {activeTab === 'Albums' && (
                  <FlatList
                      data={albums}
                      keyExtractor={(item) => item.id}
                      numColumns={2}
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      renderItem={({ item }) => (
                          <AlbumCard
                              album={item}
                              onPress={() => navigation.navigate('AlbumDetails', { albumId: item.id })}
                          />
                      )}
                      contentContainerStyle={[styles.listContent, { paddingHorizontal: 16 }]}
                  />
              )}
          </View>
      );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#121212' : '#fff'} />
      
      {/* Search Bar Area */}
      <View style={[styles.headerContainer, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                  style={[styles.input, { color: isDarkMode ? '#fff' : '#1A1A1A' }]}
                  placeholder="Search songs, artists, albums..."
                  placeholderTextColor="#aaa"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => handleSearch(query)}
                  returnKeyType="search"
                  autoFocus={false}
              />
              {query.length > 0 && (
                  <TouchableOpacity onPress={clearSearch}>
                      <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
              )}
          </View>
      </View>

      {/* Tabs - Only show if searched */}
      {hasSearched && (
          <View style={styles.tabsContainer}>
              {TABS.map(tab => (
                  <TouchableOpacity 
                      key={tab} 
                      style={[
                        styles.tabButton, 
                        { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' },
                        activeTab === tab && styles.activeTabButton,
                        activeTab === tab && isDarkMode && { backgroundColor: 'rgba(255, 107, 53, 0.15)' }
                      ]}
                      onPress={() => setActiveTab(tab)}
                  >
                      <Text style={[styles.tabText, { color: isDarkMode ? '#aaa' : '#666' }, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
          {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      // We will let the container adapt to dark mode if needed later, but the user only explicitly mentioned the Not Found image toggle.
      backgroundColor: '#fff',
  },
  headerContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
  },
  input: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: '#1A1A1A',
  },
  tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
  },
  tabButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: 'transparent',
  },
  activeTabButton: {
      backgroundColor: '#FFF0E8',
      borderColor: '#FF6B35',
  },
  tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
  },
  activeTabText: {
      color: '#FF6B35',
  },
  content: {
      flex: 1,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  recentContainer: {
      padding: 20,
  },
  recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
  },
  recentTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1A1A1A',
  },
  recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f9f9f9',
  },
  recentText: {
      marginLeft: 12,
      fontSize: 16,
      color: '#444',
  },
  emptyTitle: {
      marginTop: 16,
      fontSize: 20,
      fontWeight: '700',
      color: '#1A1A1A',
  },
  emptyText: {
      marginTop: 8,
      fontSize: 14,
      color: '#888',
      textAlign: 'center',
      paddingHorizontal: 40,
  },
  emptyImage: {
      width: 250,
      height: 250,
      marginBottom: 10,
  },
  listContent: {
      paddingBottom: 100, // Space for mini player
  },
});
