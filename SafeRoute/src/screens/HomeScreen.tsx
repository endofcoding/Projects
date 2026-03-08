import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '../context/NavigationContext';

export default function HomeScreen() {
  const { navigate } = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SafeRoute</Text>
      <Text style={styles.subtitle}>Safe Route Planning Application</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigate('Map')}
      >
        <Text style={styles.buttonText}>Start Route Planning</Text>
      </TouchableOpacity>

      <View style={styles.featureList}>
        <Text style={styles.featureTitle}>Features:</Text>
        <Text style={styles.feature}>✓ Real-time route planning</Text>
        <Text style={styles.feature}>✓ Safety-aware navigation</Text>
        <Text style={styles.feature}>✓ Offline map support</Text>
        <Text style={styles.feature}>✓ Location sharing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1e40af',
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
});
