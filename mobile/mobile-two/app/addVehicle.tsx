import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '@/types/driver';

const VEHICLE_STORAGE_KEY = 'driverVehicle';

export default function AddVehicleScreen() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [licensePlate, setLicensePlate] = useState('');
  const [color, setColor] = useState('');

  const handleSave = async () => {
    if (!brand.trim() || !model.trim() || !year.trim() || !licensePlate.trim() || !color.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos para cadastrar o veículo.');
      return;
    }

    const vehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      driverId: 'driver-123',
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      licensePlate: licensePlate.trim().toUpperCase(),
      color: color.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicle));
      Alert.alert('Veículo cadastrado', 'Seu veículo foi salvo com sucesso.');
      router.replace('/driver-dashboard');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o veículo. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Veículo</Text>
          <Text style={styles.subtitle}>Adicione ou atualize o veículo do motorista.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marca</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Toyota"
            placeholderTextColor="#777"
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Corolla"
            placeholderTextColor="#777"
            value={model}
            onChangeText={setModel}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.rowItem]}>
            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              placeholder="2024"
              placeholderTextColor="#777"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.inputGroup, styles.rowItem]}>
            <Text style={styles.label}>Cor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Preto"
              placeholderTextColor="#777"
              value={color}
              onChangeText={setColor}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC-1234"
            placeholderTextColor="#777"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>Salvar Veículo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbbbbb',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#cccccc',
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#121212',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#272727',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonText: {
    marginLeft: 10,
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
