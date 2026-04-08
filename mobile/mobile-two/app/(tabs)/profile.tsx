import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = "SUA_API_URL_AQUI"; 
const USER_TOKEN = "seu_token_aqui"; 

export default function ProfileScreen() {
  const [userStatus, setUserStatus] = useState<'USER' | 'PENDING' | 'DRIVER'>('USER');
  const [loading, setLoading] = useState(false);
  
  // ESTADOS DO FORMULÁRIO
  const [showForm, setShowForm] = useState(false);
  const [cnhNumber, setCnhNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const dependents = [
    { name: 'Lucas Rodrigues', age: 12, school: 'Colégio Santa Maria' },
    { name: 'Ana Rodrigues', age: 8, school: 'Escola Municipal Centro' },
  ];

  // Função para selecionar imagem
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleBecomeDriver = async () => {
    if (!cnhNumber || !image) {
      Alert.alert("Atenção", "Preencha a CNH e anexe a foto do documento.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('cnh', cnhNumber);
    formData.append('hasEAR', 'true');

    // Preparando a imagem para o FormData
    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('photo', {
      uri: image,
      name: `cnh_photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const response = await axios.post(`${API_BASE_URL}/drivers/apply`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${USER_TOKEN}` 
        }
      });
      
      if (response.status === 201 || response.status === 200) {
        setUserStatus('PENDING');
        setShowForm(false);
        Alert.alert("Sucesso", "Solicitação enviada! Aguarde a análise.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar os dados.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER E PERFIL CARD */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <LinearGradient colors={['#3b82f6', '#9333ea']} style={styles.avatar}>
                <Ionicons name="person" size={40} color="white" />
              </LinearGradient>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Ravel Rodrigues</Text>
                <Text style={styles.userEmail}>ravel.rodrigues@email.com</Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}><Text style={styles.statValue}>2</Text><Text style={styles.statLabel}>Contratos ativos</Text></View>
              <View style={[styles.statItem, styles.statDivider]}><Text style={styles.statValue}>{userStatus === 'DRIVER' ? '150' : '47'}</Text><Text style={styles.statLabel}>Viagens</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>2</Text><Text style={styles.statLabel}>Dependentes</Text></View>
            </View>
          </View>
        </View>

        {/* ÁREA DO MOTORISTA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Área do Motorista</Text>

          {userStatus === 'USER' && !showForm && (
            <TouchableOpacity style={[styles.listItem, styles.driverRequestBtn]} onPress={() => setShowForm(true)}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.driverBtnGradient}>
                <View style={styles.driverIconContainer}><Ionicons name="car-sport-outline" size={20} color="white" /></View>
                <Text style={styles.driverBtnText}>Quero ser motorista DriveFlex</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Solicitar Categoria</Text>
              
              <Text style={styles.inputLabel}>Número da CNH (com EAR)</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 123456789"
                placeholderTextColor="#555"
                value={cnhNumber}
                onChangeText={setCnhNumber}
              />

              <Text style={[styles.inputLabel, { marginTop: 15 }]}>Foto do Documento</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera" size={24} color="#666" />
                    <Text style={styles.uploadText}>Anexar CNH</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleBecomeDriver} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Enviar para Análise</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {userStatus === 'PENDING' && (
            <View style={[styles.listItem, styles.pendingContainer]}>
              <Ionicons name="time-outline" size={24} color="#FBBF24" />
              <Text style={styles.pendingText}>Sua análise está em andamento...</Text>
            </View>
          )}
        </View>

        {/* OPÇÕES ORIGINAIS */}
        <MenuButton icon="people-outline" label="Dependentes" sub="Gerenciar passageiros" />
        <MenuButton icon="card-outline" label="Pagamento" sub="Cartões e formas de pagamento" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuButton({icon, label, sub}: any) {
  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.menuIconContainer}><Ionicons name={icon} size={22} color="#9E9E9E" /></View>
      <View style={styles.listItemContent}><Text style={styles.listItemTitle}>{label}</Text><Text style={styles.listItemSub}>{sub}</Text></View>
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  scrollContent: {padding: 20},
  headerContainer: {marginBottom: 25},
  headerTitle: {color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  profileCard: {backgroundColor: '#1a1a1a', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#2a2a2a'},
  profileInfo: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  avatar: {width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center'},
  userDetails: {marginLeft: 15},
  userName: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  userEmail: {color: '#9E9E9E', fontSize: 14},
  statsContainer: {flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2a2a2a', marginTop: 10, paddingTop: 15},
  statItem: {flex: 1, alignItems: 'center'},
  statDivider: {borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2a2a2a'},
  statValue: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  statLabel: {color: '#666', fontSize: 10, textAlign: 'center'},
  section: {marginBottom: 25},
  sectionTitle: {color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 15},
  listItem: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a'},
  listItemContent: {flex: 1, marginLeft: 12},
  listItemTitle: {color: '#fff', fontSize: 15, fontWeight: '500'},
  listItemSub: {color: '#666', fontSize: 12},
  menuIconContainer: {width: 45, height: 45, backgroundColor: '#2a2a2a', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center'},
  
  // ESTILOS MOTORISTA
  driverRequestBtn: {overflow: 'hidden', padding: 0, borderWidth: 0},
  driverBtnGradient: {flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12},
  driverIconContainer: {width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center'},
  driverBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, flex: 1 },
  
  formContainer: {backgroundColor: '#1a1a1a', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#10b981', marginBottom: 15},
  formTitle: {color: '#10b981', fontSize: 18, fontWeight: 'bold', marginBottom: 15},
  inputLabel: {color: '#9E9E9E', fontSize: 14, marginBottom: 8},
  input: {backgroundColor: '#0a0a0a', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333'},
  uploadBtn: {backgroundColor: '#0a0a0a', borderRadius: 10, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', height: 120, justifyContent: 'center', overflow: 'hidden'},
  uploadPlaceholder: {alignItems: 'center', gap: 5},
  uploadText: {color: '#666', fontSize: 12},
  previewImage: {width: '100%', height: '100%'},
  submitBtn: {backgroundColor: '#10b981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20},
  submitBtnText: {color: '#fff', fontWeight: 'bold'},
  cancelBtn: {marginTop: 15, alignItems: 'center'},
  cancelBtnText: {color: '#666'},
  pendingContainer: {backgroundColor: '#1e1b10', borderColor: '#453008'},
  pendingText: { color: '#FBBF24', fontSize: 14, fontWeight: '500' },
});