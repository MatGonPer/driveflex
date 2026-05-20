import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/services/api';

/**
 * Define o formato dos dados para evitar erros e facilitar
 * a integração com backend Node.js.
 */
type Step = 1 | 2 | 3 | 4;
type VehicleType = 'moto' | 'car' | 'van';

export default function NewContractScreen() {
  const router = useRouter();

  // --- ESTADOS DO FORMULÁRIO ---
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [passenger, setPassenger] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupTime, setPickupTime] = useState('07:00');
  const [returnTime, setReturnTime] = useState('12:30');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
  ]);

  // --- CONFIGURAÇÕES DO LAYOUT ---
  const vehicles = [
    {
      id: 'moto' as VehicleType,
      name: 'Moto',
      icon: '🏍️',
      desc: '1 passageiro',
      price: 'R$ 300',
    },
    {
      id: 'car' as VehicleType,
      name: 'Carro',
      icon: '🚗',
      desc: 'Até 4 pass.',
      price: 'R$ 450',
    },
    {
      id: 'van' as VehicleType,
      name: 'Van',
      icon: '🚐',
      desc: 'Até 15 pass.',
      price: 'R$ 800',
    },
  ];

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // --- LÓGICA DE INTERAÇÃO ---
  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleNext = () =>
    currentStep < 4 && setCurrentStep(prev => (prev + 1) as Step);
  const handleBack = () =>
    currentStep > 1 && setCurrentStep(prev => (prev - 1) as Step);

  /**
   * ENVIO PARA API (NODE.JS)
   * Futura conexão como banco de dados futuramente.
   */
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        return;
      }

      const formatInputTime = (timeStr: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
          return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return timeStr;
      };

      const buildUtcString = (timeStr: string) => {
        if (!timeStr) return null;
        const formatted = formatInputTime(timeStr);
        const [hours, minutes] = formatted.split(':').map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString().substring(0, 19);
      };

      const startTime = buildUtcString(pickupTime);
      const endTime = buildUtcString(returnTime);

      const payload = {
        vehicleCategory: vehicleType,
        origin: origin,
        destination: destination,
        passengerName: passenger,
        startTime: startTime,
        endTime: endTime,
      };

      console.log('Integrando com API (Enviando JSON):', payload);

      await api.post('/api/contracts/hire', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Platform.OS === 'web') {
        window.alert('Solicitação Criada: Aguardando confirmação do motorista.');
      } else {
        Alert.alert('Solicitação Criada', 'Aguardando confirmação do motorista.');
      }

      // Reseta o formulário e volta para a Home
      setCurrentStep(1);
      setPassenger('');
      router.replace('/');
    } catch (error: any) {
      console.log('Erro ao criar contrato:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao criar o contrato. Tente novamente.');
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return passenger.length >= 3;
    if (currentStep === 2) return origin.length > 5 && destination.length > 5;
    if (currentStep === 3) return selectedDays.length > 0;
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DA ABA */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Novo Contrato</Text>
          <Text style={styles.headerSub}>
            Preencha as etapas ({currentStep}/4)
          </Text>
        </View>
        {currentStep > 1 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#6C28FE" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BARRA DE PROGRESSO */}
      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map(step => (
          <View
            key={step}
            style={[
              styles.progressDot,
              {backgroundColor: step <= currentStep ? '#6C28FE' : '#2a2a2a'},
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* PASSO 1: QUEM E COMO */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Nome do Passageiro</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Carlos Jr."
              placeholderTextColor="#555"
              value={passenger}
              onChangeText={setPassenger}
            />

            <Text style={[styles.label, {marginTop: 20}]}>Tipo de Veículo</Text>
            {vehicles.map(v => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setVehicleType(v.id)}
                style={[
                  styles.card,
                  vehicleType === v.id && styles.activeCard,
                ]}>
                <Text style={styles.cardIcon}>{v.icon}</Text>
                <View style={{flex: 1}}>
                  <Text style={styles.cardTitle}>{v.name}</Text>
                  <Text style={styles.cardDesc}>{v.desc}</Text>
                </View>
                <Text style={styles.cardPrice}>{v.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PASSO 2: ONDE */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Defina a Rota</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={[styles.dot, {backgroundColor: '#22c55e'}]} />
                <TextInput
                  style={styles.routeInput}
                  placeholder="Endereço de saída"
                  placeholderTextColor="#555"
                  value={origin}
                  onChangeText={setOrigin}
                />
              </View>
              <View style={styles.line} />
              <View style={styles.routeItem}>
                <View style={[styles.dot, {backgroundColor: '#ef4444'}]} />
                <TextInput
                  style={styles.routeInput}
                  placeholder="Endereço de destino"
                  placeholderTextColor="#555"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>
          </View>
        )}

        {/* PASSO 3: QUANDO */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Dias da Semana</Text>
            <View style={styles.weekRow}>
              {weekDays.map(day => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[
                    styles.dayBtn,
                    selectedDays.includes(day) && styles.activeDayBtn,
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) && styles.activeDayText,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeContainer}>
              <View style={{flex: 1}}>
                <Text style={styles.smallLabel}>Horário de Ida</Text>
                <TextInput
                  style={styles.input}
                  value={pickupTime}
                  onChangeText={setPickupTime}
                />
              </View>
              <View style={{flex: 1, marginLeft: 15}}>
                <Text style={styles.smallLabel}>Horário de Volta</Text>
                <TextInput
                  style={styles.input}
                  value={returnTime}
                  onChangeText={setReturnTime}
                />
              </View>
            </View>
          </View>
        )}

        {/* PASSO 4: REVISÃO */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Revise as informações</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewItem}>👤 {passenger}</Text>
              <Text style={styles.reviewItem}>📍 De: {origin}</Text>
              <Text style={styles.reviewItem}>🏁 Para: {destination}</Text>
              <Text style={styles.reviewItem}>
                📅 Dias: {selectedDays.join(', ')}
              </Text>
              <Text style={styles.reviewItem}>
                ⏰ Saída: {pickupTime} | Retorno: {returnTime}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTÕES DE AÇÃO (FIXOS NO RODAPÉ) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionBtn, !canProceed() && styles.disabledBtn]}
          onPress={currentStep === 4 ? handleSubmit : handleNext}
          disabled={!canProceed()}>
          {currentStep === 4 ? (
            <LinearGradient
              colors={['#6C28FE', '#4F46E5']}
              style={styles.gradientBtn}>
              <Text style={styles.btnText}>Confirmar Contrato</Text>
            </LinearGradient>
          ) : (
            <View style={styles.nextBtn}>
              <Text style={styles.btnText}>Próximo Passo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {flex: 1},
  headerTitle: {color: 'white', fontSize: 22, fontWeight: 'bold'},
  headerSub: {color: '#666', fontSize: 14, marginTop: 4},
  backButton: {flexDirection: 'row', alignItems: 'center'},
  backText: {color: '#6C28FE', fontWeight: '600'},
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {height: 4, flex: 1, borderRadius: 2},
  scrollContent: {padding: 20, paddingBottom: 120},
  stepContainer: {gap: 15},
  label: {color: 'white', fontSize: 16, fontWeight: '600'},
  input: {
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeCard: {borderColor: '#6C28FE', backgroundColor: '#1e1a2b'},
  cardIcon: {fontSize: 26, marginRight: 15},
  cardTitle: {color: 'white', fontWeight: 'bold', fontSize: 16},
  cardDesc: {color: '#666', fontSize: 12},
  cardPrice: {color: '#6C28FE', fontWeight: 'bold'},
  routeContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  routeItem: {flexDirection: 'row', alignItems: 'center', gap: 12},
  dot: {width: 8, height: 8, borderRadius: 4},
  routeInput: {flex: 1, color: 'white', fontSize: 15, paddingVertical: 12},
  line: {width: 1, height: 25, backgroundColor: '#333', marginLeft: 3},
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeDayBtn: {backgroundColor: '#6C28FE', borderColor: '#6C28FE'},
  dayText: {color: '#666', fontSize: 13},
  activeDayText: {color: 'white', fontWeight: 'bold'},
  timeContainer: {flexDirection: 'row'},
  smallLabel: {color: '#666', fontSize: 12, marginBottom: 6},
  reviewCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  reviewItem: {color: '#ddd', fontSize: 15},
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#0a0a0a',
    paddingBottom: Platform.OS === 'ios' ? 40 : 100,
  },
  actionBtn: {borderRadius: 18, overflow: 'hidden'},
  disabledBtn: {opacity: 0.4},
  nextBtn: {backgroundColor: '#6C28FE', padding: 18, alignItems: 'center'},
  gradientBtn: {padding: 18, alignItems: 'center'},
  btnText: {color: 'white', fontWeight: 'bold', fontSize: 16},
});
