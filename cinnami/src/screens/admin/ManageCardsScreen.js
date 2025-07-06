import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Modal, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { globalStyles, colors } from '../../styles/globalStyles';
import { API_BASE_URL }  from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../utils/customAlert';



const ManageCardsScreen = () => {

  //estados
  const [showForm, setShowForm] = useState(false);
  const [uid, setUid] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const uidInputRef = useRef(null);


  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);


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
  

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setDeleteModalVisible(true);
  };

  const confirmDeleteCard = async () => {
    if (cardToDelete) {
      try {
        await deleteCard(cardToDelete.id);
        setCards((prevCards) => prevCards.filter((card) => card.id !== cardToDelete.id));
        setDeleteModalVisible(false);
        setCardToDelete(null);
        showSuccess('Tarjeta eliminada correctamente');
      } catch (error) {
        showError('No se pudo eliminar la tarjeta: ' + error.message); 
      }
    }
  };

  // Crear nueva tarjeta
  const createCard = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/addCard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la tarjeta');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error de conexión');
    }
  };


//Traer todos los usuarios
  const getAllCards = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener tarjetas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAllCards:', error);
    throw error;
  }
};




  // Actualizar estado de tarjeta (HABILITAR/DESHABILITAR)
const updateCardStatus = async (cardId, currentStatus) => {
  try {
    const endpoint = currentStatus ? 'disable' : 'enable';
    const action = currentStatus ? 'deshabilitar' : 'habilitar';

    const response = await fetch(`${API_BASE_URL}/cards/${cardId}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al ${action} la tarjeta`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Error de conexión');
  }
};

  // Eliminar tarjeta
const deleteCard = async (cardId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la tarjeta');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Error de conexión');
  }
};

  // ========== FUNCIONES DEL COMPONENTE ==========

  // Cargar tarjetas al inicializar
  useEffect(() => {
    loadCards();
    console.log('Cargando tarjetas...');
  }, []);

  

  const loadCards = async () => {
    try {
      setIsLoadingCards(true);
      const response = await getAllCards();
      
      // Transformar datos de la API al formato del componente
      const transformedCards = response.cards?.map(card => ({
        id: card._id,
        number: card.uid,
        status: card.state ? 'active' : 'blocked',
        issueDate: card.issueDate,
        assignedTo: card.assignedTo,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      })) || [];
      
      setCards(transformedCards);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las tarjetas: ' + error.message);
      console.error('Error en loadCards:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setUid('');
    setError('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setUid('');
    setError('');
  };

  const handleSave = async () => {
    if (!uid.trim()) {
      setError('ID de tarjeta es requerido');
      return;
    }

    try {
      setLoading(true);
      const response = await createCard(uid.trim());
      
      if (response.success || response.message) {
        // Agregar nueva tarjeta a la lista
        const newCard = {
          id: response.card._id,
          number: response.card.uid,
          status: response.card.state ? 'active' : 'blocked',
          issueDate: response.card.issueDate,
          assignedTo: response.card.assignedTo,
          createdAt: response.card.createdAt,
          updatedAt: response.card.updatedAt
        };

        setCards([newCard, ...cards]);
        setUid('');
        setShowForm(false);
        setError('');
        showSuccess('Tarjeta creada correctamente');

      }
    } catch (error) {
      setError(error.message);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

 const toggleCardStatus = async (cardId) => {
  try {
    const card = cards.find(c => c.id === cardId);
    const currentStatus = card.status === 'active'; // Convertir a booleano
    
    setLoading(true);
    const response = await updateCardStatus(cardId, currentStatus);
    
    if (response.success || response.message) {
      // Actualizar el estado local
      setCards(cards.map(card =>
        card.id === cardId
          ? { ...card, status: currentStatus ? 'blocked' : 'active' }
          : card
      ));

      showSuccess('Tarjeta ' + (currentStatus ? 'deshabilitada' : 'habilitada') + ' exitosamente');

    }
  } catch (error) {
    showError('No se pudo cambiar el estado: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteConfirmation = (cardId, cardNumber) => {
  setCardToDelete({ id: cardId, number: cardNumber });
  setDeleteModalVisible(true);
};

const handleDeleteCancel = () => {
  setDeleteModalVisible(false);
  setCardToDelete(null);
};


// Confirmar eliminación de tarjeta
const handleDeleteConfirm = async () => {
  if (!cardToDelete) return;
  
  try {
    setLoading(true);
    const response = await deleteCard(cardToDelete.id);
    
    if (response.success || response.message) {
      setCards(cards.filter(card => card.id !== cardToDelete.id));
      setDeleteModalVisible(false);
     showSuccess(
       `Tarjeta "${cardToDelete.number}" eliminada correctamente`,
       'Éxito',
       () => setCardToDelete(null)
     );
    }
  } catch (error) {
    showError('No se pudo eliminar la tarjeta: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const filteredCards = cards.filter(card =>
    card.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        uidInputRef.current?.focus();
      }, 200);
    }
  }, [showForm]);

  if (isLoadingCards) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.canela} />
        <Text style={styles.loadingText}>Cargando tarjetas...</Text>
      </View>
    );
  }

  

  return (
    <>
      <ScrollView style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de Tarjetas</Text>
          <TouchableOpacity 
            style={[styles.headerButton, loading && styles.disabledButton]} 
            onPress={handleOpenForm}
            disabled={loading}
          >
            <MaterialIcons name="add-circle-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.headerButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Buscar tarjeta por UID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={loadCards}
            disabled={loading}
          >
            <MaterialIcons name="refresh" size={24} color={colors.canela} />
          </TouchableOpacity>
        </View>

        {/* Mostrar contador de tarjetas */}
        <Text style={styles.cardCounter}>
          {filteredCards.length} tarjeta{filteredCards.length !== 1 ? 's' : ''} 
          {searchQuery ? ' encontrada' + (filteredCards.length !== 1 ? 's' : '') : ' registrada' + (filteredCards.length !== 1 ? 's' : '')}
        </Text>

        {/* Mostrar mensaje si no hay tarjetas */}
        {cards.length === 0 && (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="credit-card" size={50} color={colors.textLight} />
            <Text style={styles.emptyText}>No hay tarjetas registradas</Text>
            <Text style={styles.emptySubtext}>Crea tu primera tarjeta presionando "Nuevo"</Text>
          </View>
        )}

        {/* Mostrar mensaje si no hay resultados de búsqueda */}
        {cards.length > 0 && filteredCards.length === 0 && searchQuery && (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="search" size={50} color={colors.textLight} />
            <Text style={styles.emptyText}>No se encontraron tarjetas</Text>
            <Text style={styles.emptySubtext}>Intenta con otro término de búsqueda</Text>
          </View>
        )}

        {/* Lista de tarjetas */}
        {filteredCards.map(card => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ID: {card.number}</Text>
              <TouchableOpacity
                
                onPress={() => handleDeleteConfirmation(card.id, card.number)}
                disabled={loading}
              >
                <MaterialIcons name="delete" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardInfo}>
              <Text style={[
                styles.cardStatus,
                { color: card.status === 'active' ? colors.success : colors.danger }
              ]}>
                ● Estado: {card.status === 'active' ? 'Activa' : 'Deshabilitada'}
              </Text>
              
              {card.createdAt && (
                <><Text style={styles.cardDate}>
                  Creada: {new Date(card.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text><View style={styles.assignedBox}>
                    {card.assignedTo ? (
                      <>
                        <FontAwesome5 name="user" size={16} color={colors.canela} style={styles.userIcon} />
                        <Text style={styles.assignedText}>
                          {card.assignedTo.firstName} {card.assignedTo.lastName}
                        </Text>
                      </>
                    ) : (
                      <>
                        <FontAwesome5 name="user-slash" size={16} color={colors.textLight} style={styles.userIcon} />
                        <Text style={styles.availableText}>Disponible</Text>
                      </>
                    )}
                  </View></>
              )}
            </View>
            
            <TouchableOpacity
              style={[
                styles.toggleStatusButton,
                { backgroundColor: card.status === 'active' ? colors.danger : colors.success },
                loading && styles.disabledButton
              ]}
              onPress={() => toggleCardStatus(card.id)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 6 }} />
              ) : (
                <FontAwesome5
                  name={card.status === 'active' ? 'lock' : 'unlock'}
                  size={16}
                  color={colors.white}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={styles.buttonText}>
                {card.status === 'active' ? 'Deshabilitar' : 'Habilitar'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal para crear nueva tarjeta */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelForm}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.subtitle}>Nueva Tarjeta</Text>

              <View style={styles.inputBlock}>
                <View style={styles.labelRow}>
                  <FontAwesome5 name="id-card" size={18} color={colors.textLight} style={styles.icon} />
                  <Text style={styles.inputLabel}>ID de Tarjeta</Text>
                </View>
                <TextInput
                  ref={uidInputRef}
                  style={[
                    styles.inputFieldStyled,
                    error ? styles.inputErrorBorder : null
                  ]}
                  placeholder="Ingresa el UID de la tarjeta"
                  value={uid}
                  onChangeText={(text) => {
                    setUid(text);
                    if (text.trim()) setError('');
                  }}
                  
                />
                {error !== '' && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <Text style={styles.infoMessage}>
               Esta tarjeta quedará activa automáticamente. Podrás cambiar su estado después de crearla.
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, loading && styles.disabledButton]} 
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 6 }} />
                  ) : (
                    <FontAwesome5 name="save" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Creando...' : 'Crear Tarjeta'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButtonCancel, loading && styles.disabledButton]} 
                  onPress={handleCancelForm}
                  disabled={loading}
                >
                  <MaterialIcons name="close" size={20} color={colors.textDark} style={{ marginRight: 6 }} />
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de confirmación para eliminar */}
<Modal
  visible={deleteModalVisible}
  animationType="fade"
  transparent={true}
  onRequestClose={handleDeleteCancel}
>
  <View style={styles.confirmationModalOverlay}>
    <View style={styles.confirmationModalContent}>
      <MaterialIcons 
        name="warning" 
        size={50} 
        color={colors.warning} 
        style={styles.warningIcon}
      />
      
      <Text style={styles.confirmationModalTitle}>¿Estás seguro?</Text>
      
      <Text style={styles.confirmationModalText}>
        Vas a eliminar la tarjeta {cardToDelete?.number}. Esta acción no se puede deshacer.
      </Text>
      
      <View style={styles.confirmationButtonRow}>
        <TouchableOpacity 
          style={[styles.confirmationButton, styles.cancelButton]}
          onPress={handleDeleteCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.confirmationButton, styles.deleteButton]}
          onPress={handleDeleteConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
      
  </View>
</Modal>

<CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        alertType={alertData.type}
        onClose={hideAlert}
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canela,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  headerButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkBeige,
    fontSize: 15,
    marginRight: 10,
  },
  refreshButton: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkBeige,
    elevation: 1,
  },
  cardCounter: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  card: {
     backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  cardDate: {
    color: colors.textLight,
    fontSize: 12,
  },
  toggleStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  inputBlock: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600',
  },
  inputFieldStyled: {
    borderWidth: 1.5,
    borderColor: colors.darkBeige,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  infoMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    backgroundColor: colors.lightBeige,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.canela,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    backgroundColor: colors.canela,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    elevation: 2,
  },
  modalButtonCancel: {
    backgroundColor: colors.lightBeige,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  modalButtonCancelText: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  cardContainer: {
    marginVertical: 5,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardUid: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardStatus: {
    fontSize: 14,
    color: '#666',
  },
  activeStatus: {
    color: 'green',
  },
  inactiveStatus: {
    color: 'red',
  },
  statusIcon: {
    marginRight: 6,
    fontSize: 16,
  },
  confirmationModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},
confirmationModalContent: {
  backgroundColor: colors.white,
  borderRadius: 15,
  padding: 25,
  width: '100%',
  alignItems: 'center',
},
warningIcon: {
  marginBottom: 15,
},
confirmationModalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.textDark,
  marginBottom: 10,
  textAlign: 'center',
},
confirmationModalText: {
  fontSize: 16,
  color: colors.textLight,
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 22,
},
confirmationButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: 10,
},
confirmationButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
cancelButton: {
  backgroundColor: colors.lightBeige,
  marginRight: 10,
  borderWidth: 1,
  borderColor: colors.darkBeige,
},
deleteButton: {
  backgroundColor: colors.danger,
  marginLeft: 10,
},
cancelButtonText: {
  color: colors.textDark,
  fontWeight: 'bold',
},
deleteButtonText: {
  color: colors.white,
  fontWeight: 'bold',
},
assignedBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f7f2ed',
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 12,
  marginTop: 6,
  alignSelf: 'flex-start',
},
userIcon: {
  marginRight: 8,
},
assignedText: {
  fontWeight: 'bold',
  color: colors.canela,
  fontSize: 15,
},
availableText: {
  fontWeight: 'bold',
  color: colors.textLight,
  fontSize: 15,
},
});

export default ManageCardsScreen;