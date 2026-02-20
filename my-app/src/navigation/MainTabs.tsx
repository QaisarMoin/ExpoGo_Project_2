import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

import { useThemeStore } from '../store/themeStore';

export const MainTabs = () => {
  const { isDarkMode } = useThemeStore();
  // Handle Android Back Button
  // If on a tab other than 'Home', go to 'Home'.
  // If on 'Home', let default behavior happen (Exit App, handled by Root Stack usually, or we can explicit Exit).
  // Since MainTabs is the root of the app visually (after Splash), we want to exit on Home.
  
  // Note: limiting specific logic inside screens is cleaner, but global tab logic works too.
  // Actually, easiest is to let normal navigation handle it, but typically users expect "Back to Home".
  
  // We'll leave default behavior for now to avoid complexity unless user specifically requested "Back to Home".
  // The user error "GO_BACK not handled" is likely from PlayerScreen.
  // I will skip adding complex logic here for now to avoid introducing bugs, 
  // and trust the PlayerScreen fix covers the reported crash.
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#F5F5F5',
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Playlists') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
