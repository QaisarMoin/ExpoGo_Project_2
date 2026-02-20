import { DarkTheme, DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniPlayer } from './src/components/MiniPlayer';
import { MainTabs } from './src/navigation/MainTabs';
import { AlbumDetailScreen } from './src/screens/AlbumDetailScreen';
import { ArtistDetailScreen } from './src/screens/ArtistDetailScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { PlaylistDetailsScreen } from './src/screens/PlaylistDetailsScreen';
import { QueueScreen } from './src/screens/QueueScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { audioService } from './src/services/audioService';
import { usePlayerStore } from './src/store/playerStore';
import { useThemeStore } from './src/store/themeStore';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { loadPersistedData, currentSong, isMiniPlayerVisible } = usePlayerStore();
  const { isDarkMode, loadTheme } = useThemeStore();
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState<string | undefined>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initialize audio service
    audioService.init();
    // Load persisted queue and last song
    loadPersistedData();
    // Load theme preference
    loadTheme();
  }, []);

  const handleStateChange = () => {
    const currentRoute = navigationRef.getCurrentRoute();
    setRouteName(currentRoute?.name);
  };

  // Hide MiniPlayer on PlayerScreen or if it's explicitly hidden
  const showMiniPlayer = isMiniPlayerVisible && currentSong && routeName !== 'Player';
  
  // Adjust bottom position: 
  // On MainTabs, bottom = Tab Bar height (65) + Tab Bar bottom margin (25) = 90
  // On other screens, bottom = 25 (margin for MiniPlayer as requested)
  // TabBar padding/insets might behave differently since we forced absolute positioning and height, 
  // so we'll use exact values matching our MainTabs styles.
  
  const isMainTabs = !routeName || ['Home', 'Favorites', 'Playlists', 'Settings'].includes(routeName);
  
  // The tab bar is explicitly 65px tall and sits 25px from the bottom.
  // Therefore the top of the tab bar is 90px from the bottom.
  const bottomPosition = isMainTabs ? 90 : 25;

  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#FFFFFF',
      border: '#333333',
    },
  };

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#1A1A1A',
      border: '#F0F0F0',
    },
  };

  return (
    <View style={[styles.root, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}>
      <NavigationContainer
        ref={navigationRef}
        theme={isDarkMode ? MyDarkTheme : MyLightTheme}
        onReady={handleStateChange}
        onStateChange={handleStateChange}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Queue" component={QueueScreen} />
          <Stack.Screen 
            name="ArtistDetails" 
            component={ArtistDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="AlbumDetails" 
            component={AlbumDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="PlaylistDetails" 
            component={PlaylistDetailsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="Search"  
            component={SearchScreen}
            options={{ animation: 'fade_from_bottom' }}
          />
        </Stack.Navigator>

        {/* MiniPlayer - persistent overlay */}
        {showMiniPlayer && (
          <View style={[styles.miniPlayerWrapper, { bottom: bottomPosition }]}>
            <MiniPlayer />
          </View>
        )}
      </NavigationContainer>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Register the root component
registerRootComponent(App);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  miniPlayerWrapper: {
    position: 'absolute',
    left: 15,
    right: 15,
    // Provide border radius to match the floating style
    borderRadius: 16,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
});
