import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import MapComponent from '../components/MapComponent';

export default function MapScreen() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routePlanned, setRoutePlanned] = useState(false);
  const { goBack } = useNavigation();

  const handlePlanRoute = () => {
    if (startLocation && endLocation) {
      setRoutePlanned(true);
      alert(`Planning route from ${startLocation} to ${endLocation}`);
    } else {
      alert('Please enter both start and end locations');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Plan Your Route</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Starting Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start location (e.g., Times Square, NYC)"
            value={startLocation}
            onChangeText={setStartLocation}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter destination (e.g., Central Park, NYC)"
            value={endLocation}
            onChangeText={setEndLocation}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.planButton} onPress={handlePlanRoute}>
          <Text style={styles.planButtonText}>
            {routePlanned ? 'Update Route' : 'Plan Safe Route'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapComponent
          startLocation={startLocation}
          endLocation={endLocation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600',
    marginRight: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    flex: 1,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  planButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

