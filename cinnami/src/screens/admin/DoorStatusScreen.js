import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from '../../styles/globalStyles';
import SuccessAlert from '../../utils/SuccessAlert'; 
import { API_BASE_URL } from '../../utils/constants';


const DoorStatusScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [doors, setDoors] = useState([]);
  const [newDoorName, setNewDoorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estados para las alertas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  // Función para mostrar alertas
  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ type, title, message, onConfirm });
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };
  // Función para obtener las puertas del backend
  const fetchDoors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/doors`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las puertas');
      }
      
      const data = await response.json();
      
      // Mapear los datos del backend al formato que usa la pantalla
      const mappedDoors = data.doors.map(door => ({
        id: door._id,
        name: door.name,
        doorId: door.doorId,
        status: door.state === 'abierta' ? 'Abierta' : 'Cerrada',
        timestamp: door.timestamp,
        originalState: door.state // Guardamos el estado original para las actualizaciones
      }));
      
      setDoors(mappedDoors);
    } catch (error) {
      console.error('Error fetching doors:', error);
      showAlert('error', 'Error', 'No se pudieron cargar las puertas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el nombre de una puerta
  const updateDoorName = async (doorId, newName) => {
    try {
      setUpdating(true);
      
      // Aquí deberás crear el endpoint en tu backend
      const response = await fetch(`${API_BASE_URL}/doors/${doorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el nombre de la puerta');
      }

      return true;
    } catch (error) {
      console.error('Error updating door name:', error);
      showAlert('error', 'Error', 'No se pudo actualizar el nombre de la puerta.');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // useEffect para cargar las puertas al montar el componente
  useEffect(() => {
    fetchDoors();
  }, []);

  const handleViewDetails = door => {
    setSelectedDoor(door);
    setModalVisible(true);
  };

  const handleEditName = door => {
    setSelectedDoor(door);
    setNewDoorName(door.name);
    setEditModalVisible(true);
  };

  const saveNewName = async () => {
    if (!newDoorName.trim()) {
      showAlert('warning', 'Advertencia', 'El nombre de la puerta no puede estar vacío.');
      return;
    }

    if (newDoorName.trim() === selectedDoor.name) {
      setEditModalVisible(false);
      return;
    }

    // Mostrar alerta de confirmación
    showAlert(
      'confirm',
      'Confirmar cambios',
      `¿Estás seguro de que quieres cambiar el nombre de "${selectedDoor.name}" a "${newDoorName.trim()}"?`,
      async () => {
        const success = await updateDoorName(selectedDoor.id, newDoorName.trim());
        
        if (success) {
          // Actualizar el estado local
          setDoors(prev =>
            prev.map(d =>
              d.id === selectedDoor.id ? { ...d, name: newDoorName.trim() } : d,
            ),
          );
          setSelectedDoor(prev => ({ ...prev, name: newDoorName.trim() }));
          setEditModalVisible(false);
          showAlert('success', '¡Éxito!', 'El nombre de la puerta se actualizó correctamente.');
        }
      }
    );
  };

  const changeStatus = newStatus => {
    setDoors(prev =>
      prev.map(d =>
        d.id === selectedDoor.id ? { ...d, status: newStatus } : d,
      ),
    );
    setSelectedDoor(prev => ({ ...prev, status: newStatus }));
  };

  const abrirPuerta = () => selectedDoor.status !== 'Abierta' && changeStatus('Abierta');
  const cerrarPuerta = () => selectedDoor.status !== 'Cerrada' && changeStatus('Cerrada');

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDoorItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text
            style={[
              styles.cardStatus,
              { color: item.status === 'Abierta' ? colors.success : colors.danger },
            ]}>
            Estado: {item.status}
          </Text>
          <Text style={styles.cardTimestamp}>
            Última actualización: {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => handleViewDetails(item)}>
            <Icon name="eye-outline" size={24} color={colors.canela} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditName(item)} style={{ marginLeft: 10 }}>
            <Icon name="pencil" size={24} color={colors.canela} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando puertas...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Puertas</Text>
          <TouchableOpacity onPress={fetchDoors} style={styles.refreshButton}>
            <Icon name="refresh" size={24} color={colors.canela} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>
          Puertas en el sistema ({doors.length})
        </Text>
        
        {doors.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="door-closed" size={60} color={colors.textLight} />
            <Text style={styles.emptyStateText}>No hay puertas registradas</Text>
          </View>
        ) : (
          <FlatList
            data={doors}
            keyExtractor={item => item.id}
            renderItem={renderDoorItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            refreshing={loading}
            onRefresh={fetchDoors}
          />
        )}
      </View>

      {/* Modal Detalles */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseIconLeft}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.textLight} />
            </TouchableOpacity>
            {selectedDoor && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Icon name="door" size={40} color={colors.primary} />
                  <Text style={styles.subtitle}>{selectedDoor.name}</Text>
                </View>
                
                <View style={styles.userDetailRow}>
                  <Icon
                    name="door"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Estado actual:</Text>
                  <Text
                    style={[
                      styles.userDetailValue,
                      {
                        color:
                          selectedDoor.status === 'Abierta' ? colors.success : colors.danger,
                      },
                    ]}>
                    {selectedDoor.status}
                  </Text>
                </View>
                
                <View style={styles.userDetailRow}>
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Última actualización:</Text>
                  <Text style={styles.userDetailValue}>{formatTimestamp(selectedDoor.timestamp)}</Text>
                </View>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, selectedDoor.status === 'Abierta' && styles.disabledButton]}
                    onPress={abrirPuerta}
                    disabled={selectedDoor.status === 'Abierta'}>
                    <Text style={styles.modalButtonText}>Abrir Puerta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, selectedDoor.status === 'Cerrada' && styles.disabledButton]}
                    onPress={cerrarPuerta}
                    disabled={selectedDoor.status === 'Cerrada'}>
                    <Text style={styles.modalButtonText}>Cerrar Puerta</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentForm}>
              <View style={styles.modalHeader}>
                <Icon name="door" size={40} color={colors.primary} />
                <Text style={styles.subtitle}>Editar Puerta</Text>
              </View>

              <View style={styles.inputBlock}>
                <View style={styles.labelRow}>
                  <Icon
                    name="pencil"
                    size={18}
                    color={colors.textLight}
                    style={styles.icon}
                  />
                  <Text style={styles.inputLabel}>Nuevo nombre de puerta</Text>
                </View>
                <TextInput
                  style={styles.inputFieldStyled}
                  placeholder="Ingrese nuevo nombre"
                  placeholderTextColor={colors.textLight}
                  value={newDoorName}
                  onChangeText={setNewDoorName}
                  autoFocus={true}
                />
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, updating && styles.disabledButton]} 
                  onPress={saveNewName}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Icon
                      name="content-save-outline"
                      size={18}
                      color={colors.white}
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={styles.modalButtonText}>
                    {updating ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setEditModalVisible(false)}
                  disabled={updating}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={colors.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Componente de Alerta Custom */}
      <SuccessAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={() => {
          if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
          }
          closeAlert();
        }}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: colors.textDark, 
    marginBottom: 15,
    flex: 1 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: colors.textDark, 
    marginBottom: 10 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 8,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  cardRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.textDark 
  },
  cardStatus: { 
    marginTop: 6, 
    fontSize: 14, 
    color: colors.textLight 
  },
  cardTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  iconGroup: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalCloseIconLeft: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    zIndex: 10 
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },

  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 14,
  },
  userDetailIcon: { 
    marginRight: 12 
  },
  userDetailLabel: { 
    flex: 0.4, 
    fontSize: 14, 
    color: colors.textLight 
  },
  userDetailValue: { 
    flex: 0.6, 
    fontSize: 15, 
    color: colors.textDark, 
    fontWeight: '600' 
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: colors.canela,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.darkBeige,
  },

  modalContentForm: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },

  inputBlock: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  inputFieldStyled: {
    borderWidth: 1.5,
    borderColor: colors.darkBeige,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.textDark,
  },
});

export default DoorStatusScreen;