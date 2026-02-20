import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistBottomSheet } from '../components/ArtistBottomSheet';
import { ArtistCard } from '../components/ArtistCard';
import { SongCard } from '../components/SongCard';
import { searchAlbums, searchArtists, searchSongs } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { Album, Artist, RootStackParamList, Song } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums'];

// Mock data helpers or derived from API
const SectionHeader = ({ title, onPress, textColor }: { title: string; onPress?: () => void; textColor: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.seeAllText}>See All</Text>
    </TouchableOpacity>
  </View>
);

const HorizontalCard = ({ item, onPress, textColor, subTextColor }: { item: Song; onPress: () => void; textColor: string; subTextColor: string }) => (
  <TouchableOpacity style={styles.horizontalCard} onPress={onPress}>
    <Image 
      source={{ uri: item.image && item.image.length > 0 ? item.image[item.image.length - 1]?.url : 'https://via.placeholder.com/140' }} 
      style={styles.cardImage} 
    />
    <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
    <Text style={[styles.cardSubtitle, { color: subTextColor }]} numberOfLines={1}>{item.primaryArtists || 'Unknown Artist'}</Text>
  </TouchableOpacity>
);

const ArtistCircle = ({ name, image, onPress, textColor }: { name: string; image: string; onPress: () => void; textColor: string }) => (
  <TouchableOpacity style={styles.artistContainer} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.artistImage} />
    <Text style={[styles.artistName, { color: textColor }]} numberOfLines={1}>{name}</Text>
  </TouchableOpacity>
);

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { isDarkMode } = useThemeStore();

  const [activeTab, setActiveTab] = useState('Suggested');
  const [query, setQuery] = useState(''); // This 'query' is for the search bar that is now removed.
  const [songs, setSongs] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [recentData, setRecentData] = useState<Song[]>([]);
  const [artistData, setArtistData] = useState<Song[]>([]);
  const [mostPlayedData, setMostPlayedData] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState(''); // This 'searchText' is for the search bar that is now removed.

  // Artists State
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showArtistSheet, setShowArtistSheet] = useState(false);
  const [artistPage, setArtistPage] = useState(1);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);

  // Albums State
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumPage, setAlbumPage] = useState(1);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [albumLoading, setAlbumLoading] = useState(false);

  // isSearching state is removed as search is moved to a separate screen.

  // Initial fetch for Suggested Content
  useEffect(() => {
    loadSuggestedContent();
  }, []);

  // Effect to handle tab changes
  useEffect(() => {
    if (activeTab === 'Songs' && songs.length === 0) { // Removed !searchText condition
       fetchSongs('latest', 1);
    } else if (activeTab === 'Artists' && artists.length === 0) { // Removed !searchText condition
       fetchDefaultArtists(1);
    } else if (activeTab === 'Albums' && albums.length === 0) { // Removed !searchText condition
       fetchAlbums('arijit', 1); // User requested default query 'arijit'
    }
  }, [activeTab]);

  const loadSuggestedContent = async () => {
    setLoading(true);
    try {
      // Fetch diverse data to populate the distinct sections
      // Recently Played (Simulated with 'Latest' or 'Trending')
      const [recentRes, artistRes, mostPlayedRes] = await Promise.all([
        searchSongs('latest english', 1, 10),
        searchSongs('best artists', 1, 10), 
        searchSongs('global top 20', 1, 10)
      ]);

      setRecentData(recentRes.songs);
      // For artists, ideally we'd have an artists endpoint, but we extract from songs
      setArtistData(artistRes.songs);
      setMostPlayedData(mostPlayedRes.songs);
    } catch (e) {
      console.log('Failed to load suggested', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = useCallback(async (q: string, p: number, append = false) => {
    if (!q.trim()) return;
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const { songs: results, total } = await searchSongs(q, p);
      setSongs(prev => {
        if (append) {
          const newSongs = results.filter(r => !prev.some(p => p.id === r.id));
          return [...prev, ...newSongs];
        }
        return results;
      });
      setHasMore(results.length === 20 && (p * 20) < total);
    } catch (e: any) {
      setError(e.message || 'Failed to load songs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 🌟 CURATED LIST OF GLOBAL SUPERSTARS (for Infinite Scroll)
  const FAMOUS_ARTISTS = [
    // India (Bollywood/Pop/Indie)
    'Arijit Singh', 'Atif Aslam', 'Sonu Nigam', 'Shreya Ghoshal', 'Badshah', 
    'Diljit Dosanjh', 'Neha Kakkar', 'Sidhu Moose Wala', 'A.R. Rahman', 'Pritam',
    'KK', 'Mohit Chauhan', 'Jubin Nautiyal', 'Armaan Malik', 'Darshan Raval',
    'Anuv Jain', 'Prateek Kuhad', 'King', 'MC Stan', 'Divine', 'Emiway Bantai',
    'Yo Yo Honey Singh', 'Guru Randhawa', 'Harrdy Sandhu', 'Sunidhi Chauhan',
    'Udit Narayan', 'Alka Yagnik', 'Kumar Sanu', 'Shaan', 'Amit Trivedi',
    // Global Pop/Hip-Hop
    'Justin Bieber', 'Taylor Swift', 'The Weeknd', 'Drake', 'Eminem',
    'Ed Sheeran', 'Ariana Grande', 'Post Malone', 'Bruno Mars', 'Coldplay',
    'Imagine Dragons', 'Maroon 5', 'Shawn Mendes', 'Dua Lipa', 'Billie Eilish',
    'Rihanna', 'Beyonce', 'Selena Gomez', 'Harry Styles', 'Adele',
    'Kanye West', 'Kendrick Lamar', 'Travis Scott', 'J. Cole', 'Future',
    'XXXTENTACION', 'Juice WRLD', 'Lil Uzi Vert', 'Cardi B', 'Nicki Minaj',
    // K-Pop / Latin / Others
    'BTS', 'BLACKPINK', 'Bad Bunny', 'J Balvin', 'Shakira', 'Daddy Yankee',
    'Alan Walker', 'Marshmello', 'DJ Snake', 'David Guetta', 'Calvin Harris'
  ];

  // Fetch diverse artists with Pagination (Batch of 5)
  const fetchDefaultArtists = useCallback(async (pageNum: number = 1) => {
      if (loading) return;
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
          // Pagination Logic: Slice the big list
          const BATCH_SIZE = 5; 
          const start = (pageNum - 1) * BATCH_SIZE;
          const end = start + BATCH_SIZE;
          const batch = FAMOUS_ARTISTS.slice(start, end);

          if (batch.length === 0) {
              setHasMoreArtists(false);
              setLoading(false);
              setLoadingMore(false);
              return;
          }

          // Fetch top 1 result for each name (Precision > Quantity for curated list)
          const promises = batch.map(q => searchArtists(q, 1, 1)); 
          const results = await Promise.all(promises);
          
          let newArtists: Artist[] = [];
          results.forEach(res => {
              newArtists = [...newArtists, ...res.artists];
          });

          // Deduplicate
          newArtists = newArtists.filter(a => !!a && !!a.id); // Ensure valid
          
          setArtists(prev => {
              if (pageNum === 1) return newArtists;
              // Filter duplicates against previous state
              const filtered = newArtists.filter(n => !prev.some(p => p.id === n.id));
              return [...prev, ...filtered];
          });
          
          setHasMoreArtists(end < FAMOUS_ARTISTS.length);
      } catch (e) {
          console.error('Failed to load default artists', e);
      } finally {
          setLoading(false);
          setLoadingMore(false);
      }
  }, []);

  const fetchArtists = useCallback(async (q: string, p: number, append = false) => {
    if (!q.trim()) return;
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const { artists: results, total } = await searchArtists(q, p);
      setArtists(prev => {
        if (append) {
          const newArtists = results.filter(r => !prev.some(p => p.id === r.id));
          return [...prev, ...newArtists];
        }
        return results;
      });
      setHasMoreArtists(results.length === 20 && (p * 20) < total);
    } catch (e: any) {
      console.log('Error fetching artists', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch Albums
  const fetchAlbums = useCallback(async (q: string, p: number, append = false) => {
      if (albumLoading) return;
      setAlbumLoading(true);
      try {
          const res = await searchAlbums(q, p, 20);
          setAlbums(prev => {
              if (append) {
                 return [...prev, ...res.albums];
              }
              return res.albums;
          });
          setHasMoreAlbums(res.albums.length === 20);
      } catch (e) {
          console.error("Failed to fetch albums", e);
      } finally {
          setAlbumLoading(false);
      }
  }, [albumLoading]);

  // handleSearch is removed as search is moved to a separate screen.

  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    
    if (activeTab === 'Songs' && hasMore) {
        setPage(prev => prev + 1);
        fetchSongs('latest', page + 1, true); // Removed searchText
    } else if (activeTab === 'Artists' && hasMoreArtists) {
        const nextPage = artistPage + 1;
        setArtistPage(nextPage);
        
        // Removed searchText condition
        fetchDefaultArtists(nextPage);
    } else if (activeTab === 'Albums' && hasMoreAlbums) {
        const nextPage = albumPage + 1;
        setAlbumPage(nextPage);
        fetchAlbums('arijit', nextPage, true); // Removed searchText
    }
  };

  const handlePlay = useCallback(async (song: Song, list: Song[] = []) => {
    await playSong(song, list.length ? list : [song]);
    navigation.navigate('Player');
  }, [playSong, navigation]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#ccc' : '#888';
  const separatorColor = isDarkMode ? '#333' : '#F5F5F5';
  const searchBgColor = isDarkMode ? '#333' : '#F5F5F5';

  if (loading && activeTab === 'Suggested') { // Only show full screen loader for initial suggested content
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={bgColor} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  const renderSuggestedView = () => {
    return (
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: currentSong ? 160 : 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Recently Played Section */}
        <SectionHeader title="Recently Played" onPress={() => setActiveTab('Songs')} textColor={textColor} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {recentData.map(song => (
            <HorizontalCard 
              key={song.id} 
              item={song} 
              onPress={() => handlePlay(song, recentData)} 
              textColor={textColor}
              subTextColor={subTextColor}
            />
          ))}
        </ScrollView>

        {/* Artists Section */}
        <SectionHeader title="Artists" onPress={() => setActiveTab('Artists')} textColor={textColor} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {artistData.map(song => (
            <ArtistCircle 
              key={`artist-${song.id}`}
              name={(song.primaryArtists || song.name).split(',')[0]} 
              image={song.image && song.image.length > 0 ? song.image[song.image.length - 1]?.url : 'https://via.placeholder.com/100'} 
              onPress={() => navigation.navigate('ArtistDetails', { artistId: song.artists?.primary?.[0]?.id || song.id, initialArtist: { id: song.id, name: song.primaryArtists, url: '', image: song.image, type: 'artist', role: 'music' } })} 
              textColor={textColor}
            />
          ))}
        </ScrollView>

        {/* Most Played Section */}
        <SectionHeader title="Most Played" onPress={() => setActiveTab('Songs')} textColor={textColor} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {mostPlayedData.map(song => (
            <HorizontalCard 
              key={song.id} 
              item={song} 
              onPress={() => handlePlay(song, mostPlayedData)} 
              textColor={textColor}
              subTextColor={subTextColor}
            />
          ))}
        </ScrollView>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={bgColor} />
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: textColor }]}>{getGreeting()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search' as any)}>
            <Ionicons name="search" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && { color: '#FF6B35' }, { color: activeTab !== tab ? subTextColor : undefined }]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar - Toggle visibility (Removed as search is moved to a separate screen) */}
        {/* Content Switcher */}
        {activeTab === 'Suggested' ? (
          renderSuggestedView()
        ) : activeTab === 'Artists' ? (
           /* Artists List */
           <FlashList
             data={artists}
             keyExtractor={(item) => item.id}
             ListHeaderComponent={() => (
                 <View style={styles.songsHeader}>
                   <Text style={[styles.songsCount, { color: textColor }]}>{artists.length || '0'} artists</Text>
                   <TouchableOpacity style={styles.sortBtn}>
                     <Text style={styles.sortText}>Date Added</Text>
                     <Ionicons name="swap-vertical" size={16} color="#FF6B35" />
                   </TouchableOpacity>
                 </View>
             )}
             renderItem={({ item }) => (
               <ArtistCard
                 artist={item}
                 onPress={() => {
                     navigation.navigate('ArtistDetails', {
                         artistId: item.id,
                         initialArtist: item
                     });
                 }}
                 isDarkMode={isDarkMode}
               />
             )}
             onEndReached={handleLoadMore}
             onEndReachedThreshold={0.5}
             showsVerticalScrollIndicator={false}
             contentContainerStyle={{
               paddingBottom: currentSong ? 160 : 100,
             }}
             ListEmptyComponent={artists.length === 0 && !loading ? <View style={styles.emptyList}><Text style={{textAlign: 'center', color: subTextColor}}>No artists found</Text></View> : null}
             ListFooterComponent={loadingMore ? <ActivityIndicator color="#FF6B35" /> : null}
             ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: separatorColor }]} />}
           />
        ) : activeTab === 'Albums' ? (
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <AlbumCard 
                album={item} 
                onPress={(album) => navigation.navigate('AlbumDetails', { albumId: album.id })} 
                isDarkMode={isDarkMode}
              />
            )}
            style={{flex: 1}}
            contentContainerStyle={{ paddingBottom: currentSong ? 160 : 100, paddingTop: 16 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            // Optimization Props
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListFooterComponent={albumLoading && albumPage > 1 ? <ActivityIndicator color="#FF6B35" style={{margin: 20}} /> : null}
            ListEmptyComponent={!albumLoading && albums.length === 0 ? <View style={{padding: 20}}><Text style={{textAlign: 'center', color: subTextColor}}>No albums found</Text></View> : null}
          />
        ) : (
          /* Search/Songs Results List */
          <FlashList
            data={songs}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              activeTab === 'Songs' ? (
                <View style={styles.songsHeader}>
                  <Text style={[styles.songsCount, { color: textColor }]}>{songs.length || '0'} songs</Text>
                  <TouchableOpacity style={styles.sortBtn}>
                    <Text style={styles.sortText}>Ascending</Text>
                    <Ionicons name="swap-vertical" size={16} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              ) : null
            )}
            renderItem={({ item, index }) => (
              <SongCard
                song={item}
                onPlay={() => handlePlay(item, songs)}
                isActive={currentSong?.id === item.id}
                isPlaying={currentSong?.id === item.id && isPlaying}
                isDarkMode={isDarkMode}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: currentSong ? 160 : 100,
            }}
            ListEmptyComponent={songs.length === 0 && !loading ? <View style={styles.emptyList}><Text style={{textAlign: 'center', color: subTextColor}}>No songs found</Text></View> : null}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#FF6B35" /> : null}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: separatorColor }]} />}
          />
        )}
        
        <ArtistBottomSheet 
            visible={showArtistSheet}
            onClose={() => setShowArtistSheet(false)}
            artist={selectedArtist}
        />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tabItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTabItem: {
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeIndicator: {
    height: 3,
    backgroundColor: '#FF6B35',
    width: '60%',
    marginTop: 4,
    borderRadius: 1.5,
  },
  scrollContent: {
   // Padding bottom handled dynamically
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  horizontalCard: {
    width: 140,
    marginRight: 0,
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  artistContainer: {
    alignItems: 'center',
    width: 100,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  separator: {
    height: 1,
    marginLeft: 16, // Adjusted separator margin
  },
  songsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  songsCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
