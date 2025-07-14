import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, colors } from '../../styles/globalStyles';
import { API_BASE_URL } from '../../utils/constants';
import { Portal, Modal, Provider } from 'react-native-paper';
import SuccessAlert from '../../utils/SuccessAlert';
import SwitchToggle from 'react-native-switch-toggle';
//import { ScrollView } from 'react-native-gesture-handler';

const CardStatusScreen = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [successAlert, setSuccessAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });

  // animacion para la tarjeta de volteo
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const flipCard = () => {
    setIsCardFlipped(!isCardFlipped);
    Animated.timing(flipAnim, {
      toValue: isCardFlipped ? 0 : 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

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

  const showSuccessAlert = (title, message, type = 'success', onConfirm = null) => {
    setSuccessAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const hideSuccessAlert = () => {
    setSuccessAlert({
      ...successAlert,
      visible: false
    });
  };

  // Obtener información de la tarjeta 
  useEffect(() => {
    fetchCardData();
  }, []);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchCardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cardId = await AsyncStorage.getItem('cardId');
      
      if (!token) {
        Alert.alert('Error', 'No se encontró token de autenticación');
        return;
      }

      if (!cardId) {
        Alert.alert('Error', 'No se encontró ID de tarjeta. Vuelve a iniciar sesión.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cards/by-uid/${cardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCardData(data.card);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo obtener información de la tarjeta');
      }
    } catch (error) {
      console.error('Error fetching card data:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para bloquear/desbloquear manualmente por el toogle verde
  const handleToggleCardStatus = async () => {
    if (!cardData) return;

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const endpoint = cardData.state 
        ? `${API_BASE_URL}/cards/${cardData._id}/disable`
        : `${API_BASE_URL}/cards/${cardData._id}/enable`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        setCardData(prev => ({
          ...prev,
          state: !prev.state,
          updatedAt: new Date()
        }));

        showSuccessAlert(
          'Éxito',
          `Tarjeta ${cardData.state ? 'bloqueada' : 'desbloqueada'} correctamente`,
          'success'
        );
      } else {
        const error = await response.json();
        showSuccessAlert(
          'Error',
          error.message || 'Error al actualizar el estado de la tarjeta',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating card status:', error);
      showSuccessAlert(
        'Error',
        'Error de conexión al actualizar el estado',
        'error'
      );
    } finally {
      setUpdating(false);
    }
  };

  // Función para desasignar permanentemente la tarjeta
  const handleUnassignCard = async () => {
    if (!cardData) return;

    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        showSuccessAlert(
          'Error',
          'No se encontraron datos de usuario. Por favor, vuelve a iniciar sesión.',
          'error'
        );
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData._id;
      
      if (!userId) {
        showSuccessAlert(
          'Error',
          'No se encontró el ID de usuario. Por favor, vuelve a iniciar sesión.',
          'error'
        );
        return;
      }

      showSuccessAlert(
        'Confirmar desasignación',
        'Esta acción desasignará permanentemente la tarjeta de tu cuenta. ¿Estás seguro? Esta acción no se puede deshacer.',
        'confirm',
        async () => {
          try {
            setUpdating(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const cardResponse = await fetch(`${API_BASE_URL}/cards/${cardData._id}/unassign`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (cardResponse.ok) {
              const userReleaseUrl = `${API_BASE_URL}/users/${userId}/release-card`;
              
              const userResponse = await fetch(userReleaseUrl, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (userResponse.ok) {
                await AsyncStorage.removeItem('cardId');
                
                userData.cardId = null;
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                
                showSuccessAlert(
                  'Tarjeta desasignada',
                  'La tarjeta ha sido desasignada correctamente de tu cuenta',
                  'success'
                );
                
                setCardData(null);
              } else {
                const userError = await userResponse.json();
                console.error('Error liberando usuario:', userError);
                showSuccessAlert(
                  'Error parcial',
                  'La tarjeta fue desasignada pero hubo un error al liberar tu usuario. Contacta al administrador.',
                  'error'
                );
              }
            } else {
              const error = await cardResponse.json();
              showSuccessAlert(
                'Error',
                error.message || 'Error al desasignar la tarjeta',
                'error'
              );
            }
          } catch (error) {
            console.error('Error unassigning card:', error);
            showSuccessAlert(
              'Error',
              'Error de conexión al desasignar la tarjeta',
              'error'
            );
          } finally {
            setUpdating(false);
          }
        }
      );
    } catch (error) {
      console.error('Error getting user data:', error);
      showSuccessAlert(
        'Error',
        'Error al obtener datos del usuario',
        'error'
      );
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
        <Text style={{ marginTop: 10, color: colors.textLight }}>No tienes una tarjeta asignada</Text>
        <Text style={{ marginTop: 5, color: colors.textLight, textAlign: 'center' }}>
          Contacta al administrador para obtener una nueva tarjeta
        </Text>
        <TouchableOpacity 
          style={[globalStyles.button, { marginTop: 20 }]}
          onPress={fetchCardData}
        >
          <Text style={globalStyles.buttonText}>Verificar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text>No se encontraron datos del usuario</Text>
      </View>
    );
  }


  return (
    <ScrollView style={[globalStyles.container, { padding: 0 }]}
    contentContainerStyle={{ paddingBottom: 50 }}
    showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Tarjeta</Text>
      </View>

      {/* Contenido desplazable */}
      <View style={styles.content}>
        {/* Tarjeta animada */}
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
          <View style={styles.cardContainer}>
            {/* Frente de la tarjeta */}
            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardBankName}>CINNAMI</Text>
                <Icon 
                  name="chip" 
                  size={40} 
                  color={colors.white} 
                  style={styles.cardChip}
                />
              </View>
              
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumber}>•••• •••• •••• {cardData.uid.slice(-4)}</Text>
              </View>
              
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>TITULAR</Text>
                  <Text style={styles.cardText}>{userData.firstName} {userData.lastName}</Text>
                </View>
                <View style={[styles.cardStatusBadge, { 
                  backgroundColor: cardData.state ? colors.success : colors.danger 
                }]}>
                  <Text style={styles.cardStatusText}>
                    {cardData.state ? 'ACTIVA' : 'BLOQUEADA'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Reverso de la tarjetaaaaaaaa */}
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
              <View style={styles.cardStripe} />
              <View style={styles.cardSignature}>
                <Text style={styles.cardSignatureText}>FIRMA DEL TITULAR</Text>
                <View style={styles.cardSignatureLine} />
              </View>
              <Text style={styles.cardContact}>Servicio al cliente: 0800-123-4567</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Estado y última actualización */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="update" size={20} color={colors.textLight} />
            <Text style={styles.infoText}>
              Último cambio: {formatDate(cardData.updatedAt)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="identifier" size={20} color={colors.textLight} />
            <Text style={styles.infoText}>{cardData.uid}</Text>
          </View>
        </View>

        {/* Toggle para bloquear/desbloquear */}
        <View style={styles.controlCard}>
          <Text style={styles.controlTitle}>Estado de la tarjeta</Text>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {cardData.state ? 'Tarjeta activa' : 'Tarjeta bloqueada'}
            </Text>
            <SwitchToggle
              switchOn={cardData.state}
              onPress={handleToggleCardStatus}
              circleColorOff={colors.white}
              circleColorOn={colors.white}
              backgroundColorOn={colors.success}
              backgroundColorOff={colors.danger}
              containerStyle={styles.toggle}
              circleStyle={styles.toggleCircle}
              duration={300}
              disabled={updating}
            />
          </View>
          
          <Text style={styles.toggleDescription}>
            {cardData.state 
              ? 'Puedes bloquear temporalmente tu tarjeta si la extravías.'
              : 'Tu tarjeta está bloqueada y no puede usarse para pagos.'}
          </Text>
        </View>

        {/* Botón de desasignación */}
        <View style={styles.controlCard}>
          <Text style={styles.controlTitle}>Desasignar tarjeta</Text>
          <Text style={styles.warningText}>
            Esta acción liberará la tarjeta de tu cuenta permanentemente. Solo hazlo si has perdido la tarjeta.
          </Text>
          
          <TouchableOpacity
            style={[
              styles.dangerButton,
              { opacity: updating ? 0.6 : 1 }
            ]}
            onPress={handleUnassignCard}
            disabled={updating}
          >
            <View style={styles.buttonContent}>
              
              {updating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  Desasignar Tarjeta Permanentemente
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Componente de alerta personalizada */}
      <SuccessAlert
        visible={successAlert.visible}
        title={successAlert.title}
        message={successAlert.message}
        type={successAlert.type}
        onClose={hideSuccessAlert}
        onConfirm={successAlert.onConfirm}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.canela,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  cardContainer: {
    height: 200,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: colors.canela,
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: '#333',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBankName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardChip: {
    marginTop: 10,
  },
  cardNumberContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  cardNumber: {
    color: colors.white,
    fontSize: 22,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: colors.white,
    fontSize: 10,
    opacity: 0.8,
  },
  cardText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardStatusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardStripe: {
    height: 40,
    backgroundColor: '#222',
    width: '100%',
    position: 'absolute',
    top: 20,
  },
  cardSignature: {
    width: '70%',
    marginBottom: 30,
  },
  cardSignatureText: {
    color: colors.white,
    fontSize: 10,
    marginBottom: 5,
  },
  cardSignatureLine: {
    height: 30,
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  cardContact: {
    color: colors.white,
    fontSize: 10,
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: colors.textLight,
    marginLeft: 10,
    fontSize: 14,
  },
  controlCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.textDark,
  },
  toggle: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 3,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  toggleDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 15,
    lineHeight: 20,
  },
});

export default CardStatusScreen;