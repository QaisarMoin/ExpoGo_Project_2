import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';

export const SettingsScreen = () => {
  const { isDarkMode, toggleTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  const bgColor = isDarkMode ? '#1A1A1A' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1A1A1A';
  const cardColor = isDarkMode ? '#2A2A2A' : '#F5F5F5';
  const subTextColor = isDarkMode ? '#aaa' : '#888';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={bgColor} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color={textColor} style={styles.icon} />
            <View>
              <Text style={[styles.settingTitle, { color: textColor }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtext, { color: subTextColor }]}>
                Toggle dark theme for the app
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#FF6B35' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtext: {
    fontSize: 12,
  },
});
