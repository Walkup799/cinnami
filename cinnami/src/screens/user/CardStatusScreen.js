import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, colors } from '../../styles/globalStyles';
import { API_BASE_URL } from '../../utils/constants';
import CustomAlert from '../../utils/customAlert';
import { Portal, Modal, Provider} from 'react-native-paper';
import SuccessAlert from '../../utils/SuccessAlert'; // Asegúrate de que la ruta sea correcta

const CardStatusScreen = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [temporaryBlock, setTemporaryBlock] = useState(false);
  const [blockDuration, setBlockDuration] = useState('1');
  const [updating, setUpdating] = useState(false);
  const [temporaryBlockInfo, setTemporaryBlockInfo] = useState(null);
   const [successAlert, setSuccessAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });

   // Estados para alertas
        const [alertData, setAlertData] = useState({
          visible: false,
          title: '',
          message: '',
          type: 'warning'
        });
        // Helpers de alerta
        const showAlert = (title, message, type = 'warning') => {
          setAlertData({
            visible: true,
            title,
            message,
            type
          });
        };
      
        const hideAlert = () => {
          setAlertData(prev => ({ ...prev, visible: false }));
        };
      
        const showError = (message, title = 'Error') => showAlert(title, message, 'warning');
        const showSuccess = (message, title = 'Éxito') => showAlert(title, message, 'success');
    
  const showSuccessAlert = (title, message, type = 'success') => {
    setSuccessAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideSuccessAlert = () => {
    setSuccessAlert({
      ...successAlert,
      visible: false
    });
  };


  // Obtener información de la tarjeta al montar el componente
  useEffect(() => {
    fetchCardData();
    checkTemporaryBlock();
  }, []);

  // Verificar si hay un bloqueo temporal activo
  const checkTemporaryBlock = async () => {
    try {
      const temporaryBlockData = await AsyncStorage.getItem('temporaryBlock');
      if (temporaryBlockData) {
        const blockInfo = JSON.parse(temporaryBlockData);
        const now = new Date();
        const unblockTime = new Date(blockInfo.unblockTime);
        
        if (now < unblockTime) {
          setTemporaryBlockInfo(blockInfo);
          // Programar desbloqueo automático
          const remainingTime = unblockTime - now;
          setTimeout(() => {
            handleAutoUnblock(blockInfo.cardId);
          }, remainingTime);
        } else {
          // El bloqueo ya expiró, limpiar
          await AsyncStorage.removeItem('temporaryBlock');
        }
      }
    } catch (error) {
      console.error('Error checking temporary block:', error);
    }
  };

  const handleAutoUnblock = async (cardId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      // Obtener información de la tarjeta usando el endpoint correcto
      const cardResponse = await fetch(`${API_BASE_URL}/cards/by-uid/${cardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        const card = cardData.card;
        
        const response = await fetch(`${API_BASE_URL}/cards/${card._id}/enable`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Tarjeta desbloqueada automáticamente');
          await AsyncStorage.removeItem('temporaryBlock');
          setTemporaryBlockInfo(null);
          fetchCardData(); // Refrescar datos
        }
      }
    } catch (error) {
      console.error('Error auto-unblocking card:', error);
    }
  };

  const fetchCardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cardId = await AsyncStorage.getItem('cardId'); // El UID de la tarjeta
      
      console.log('Datos obtenidos de AsyncStorage:', { token: token ? 'Existe' : 'No existe', cardId });
      
      if (!token) {
        Alert.alert('Error', 'No se encontró token de autenticación');
        return;
      }

      if (!cardId) {
        Alert.alert('Error', 'No se encontró ID de tarjeta. Vuelve a iniciar sesión.');
        return;
      }

      console.log('Haciendo fetch a:', `${API_BASE_URL}/cards/by-uid/${cardId}`);

      const response = await fetch(`${API_BASE_URL}/cards/by-uid/${cardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta del servidor:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Datos de la tarjeta obtenidos:', data);
        setCardData(data.card);
      } else {
        const errorData = await response.json();
        console.log('Error del servidor:', errorData);
        Alert.alert('Error', errorData.message || 'No se pudo obtener información de la tarjeta');
      }
    } catch (error) {
      console.error('Error fetching card data:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async () => {
    if (!cardData) return;

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      let endpoint = '';
      let method = 'PUT';
      
      if (cardData.state && temporaryBlock) {
        // Bloqueo temporal - usar endpoint de deshabilitar + timer local
        endpoint = `${API_BASE_URL}/cards/${cardData._id}/disable`;
        
        // Guardar información del bloqueo temporal
        const unblockTime = new Date();
        unblockTime.setHours(unblockTime.getHours() + parseInt(blockDuration));
        
        const temporaryBlockData = {
          cardId: cardData.uid,
          unblockTime: unblockTime,
          isTemporary: true,
          mongoId: cardData._id
        };
        
        await AsyncStorage.setItem('temporaryBlock', JSON.stringify(temporaryBlockData));
        setTemporaryBlockInfo(temporaryBlockData);
        
        // Programar desbloqueo automático
        setTimeout(() => {
          handleAutoUnblock(cardData.uid);
        }, parseInt(blockDuration) * 60 * 60 * 1000);
        
      } else if (cardData.state && !temporaryBlock) {
        // Bloqueo permanente - usar endpoint de deshabilitar
        endpoint = `${API_BASE_URL}/cards/${cardData._id}/disable`;
      } else {
        // Desbloquear - usar endpoint de habilitar
        endpoint = `${API_BASE_URL}/cards/${cardData._id}/enable`;
        
        // Limpiar bloqueo temporal si existe
        await AsyncStorage.removeItem('temporaryBlock');
        setTemporaryBlockInfo(null);
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar estado local
        setCardData(prev => ({
          ...prev,
          state: !prev.state,
          updatedAt: new Date()
        }));

        // Mostrar mensaje de éxito
        if (temporaryBlock && cardData.state) {
          showSuccessAlert(
          'Éxito',
          `Tarjeta bloqueada temporalmente por ${blockDuration} hora(s)`,
          'success'
        );
        } else {
          showSuccessAlert(
          'Éxito',
          result.message,
          'success'
        );
        }
        
        // Resetear el switch temporal
        setTemporaryBlock(false);
      } else {
        const error = await response.json();
         showSuccessAlert(
        'Error',
        'Error al actualizar el estado de la tarjeta',
        'error'
      );
      }
    } catch (error) {
      console.error('Error updating card status:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

   const handleDurationPress = (hours) => {
    showSuccessAlert(
      'Confirmar bloqueo',
      `¿Está seguro que desea bloquear esta tarjeta por ${hours} hora(s)?`,
      'confirm',
      () => {
        setBlockDuration(hours);
        setTemporaryBlock(true);
        // Ejecutar el bloqueo inmediatamente
        setTimeout(() => handleBlockCard(), 100);
        hideSuccessAlert();
      }
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getRemainingTime = () => {
    if (!temporaryBlockInfo?.unblockTime) return null;
    
    const now = new Date();
    const unblockTime = new Date(temporaryBlockInfo.unblockTime);
    const diff = unblockTime - now;
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.canela} />
        <Text style={{ marginTop: 10, color: colors.textLight }}>Cargando información...</Text>
      </View>
    );
  }

  if (!cardData) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="credit-card-off" size={80} color={colors.textLight} />
        <Text style={{ marginTop: 10, color: colors.textLight }}>No se encontró información de la tarjeta</Text>
        <TouchableOpacity 
          style={[globalStyles.button, { marginTop: 20 }]}
          onPress={fetchCardData}
        >
          <Text style={globalStyles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={[globalStyles.card, { alignItems: 'center' }]}>
        <Text style={[globalStyles.subtitle, { fontSize: 22 }]}>Estado de tu tarjeta</Text>

        <Icon
          name="credit-card-chip"
          size={100}
          color={cardData.state ? colors.success : colors.danger}
          style={{ marginVertical: 10 }}
        />

        <Text
          style={[
            globalStyles.title,
            {
              fontSize: 32,
              color: cardData.state ? colors.success : colors.danger,
            },
          ]}
        >
          {cardData.state ? 'ACTIVA' : 'BLOQUEADA'}
        </Text>

        <View
          style={[
            styles.statusChip,
            { backgroundColor: cardData.state ? colors.success : colors.danger },
          ]}
        >
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>
            {cardData.state ? 'Activa' : 'Bloqueada'}
          </Text>
        </View>

        {/* Mostrar UID de la tarjeta */}
        <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 6 }}>
          UID: {cardData.uid}
        </Text>

        {/* Mostrar tiempo restante si hay bloqueo temporal */}
        {temporaryBlockInfo && (
          <Text style={{ color: colors.canela, fontSize: 12, marginTop: 2 }}>
            {getRemainingTime()}
          </Text>
        )}

        <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 6 }}>
          Último cambio: {formatDate(cardData.lastUpdate)}
        </Text>
      </View>

      <View style={[globalStyles.card, { marginTop: 20 }]}>
        <View style={styles.headerRow}>
          <Text style={globalStyles.subtitle}>Opciones de bloqueo</Text>
           <TouchableOpacity
        onPress={() =>
          showSuccessAlert(
            'Información',
            'El bloqueo temporal desactiva tu tarjeta por unas horas. El permanente es indefinido hasta que lo desbloquees.',
            'info'
          )
        }
      >
            <Icon name="information-outline" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Solo mostrar opciones si la tarjeta está activa */}
        {cardData.state && (
          <>
            <View style={styles.optionRow}>
              <Icon name="calendar-clock" size={20} color={colors.canela} style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: colors.textDark }}>Bloqueo temporal</Text>
              <Switch
                value={temporaryBlock}
                onValueChange={setTemporaryBlock}
                thumbColor={colors.white}
                trackColor={{ false: colors.textLight, true: colors.canela }}
              />
            </View>

            {temporaryBlock && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: colors.textLight, marginBottom: 5 }}>Duración del bloqueo:</Text>
                <View style={styles.durationOptions}>
                  {['1', '3', '6', '12'].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.durationButton,
                        { backgroundColor: colors.canela },
                      ]}
                      onPress={() => handleDurationPress(hours)}
                    >
                      <Text style={styles.durationText}>{hours} h</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              marginTop: 20,
              backgroundColor: colors.canela,
              opacity: updating ? 0.6 : 1,
            },
          ]}
          onPress={handleBlockCard}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>
              {cardData.state
                ? temporaryBlock
                  ? 'Bloquear Temporalmente'
                  : 'Bloquear Permanentemente'
                : 'Desbloquear Tarjeta'}
            </Text>
          )}
        </TouchableOpacity>

         {/* Componente de alerta personalizada */}
      <SuccessAlert
        visible={successAlert.visible}
        title={successAlert.title}
        message={successAlert.message}
        type={successAlert.type}
        onClose={hideSuccessAlert}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    padding: 10,
    borderRadius: 5,
    width: '23%',
    alignItems: 'center',
  },
  durationText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
});

export default CardStatusScreen;