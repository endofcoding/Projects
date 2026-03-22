import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';

function AppContent() {
  const { currentScreen } = useNavigation();

  return (
    <View style={styles.container}>
      {currentScreen === 'Home' && <HomeScreen />}
      {currentScreen === 'Map' && <MapScreen />}
    </View>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
});
