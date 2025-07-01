import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from '../../styles/globalStyles';

const DoorStatusScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [doors, setDoors] = useState([
    {
      id: '1',
      name: 'Puerta Norte',
      cardId: 'A12345',
      status: 'Abierta',
      date: '01 Jul 2025',
      time: '08:30 AM',
    },
    {
      id: '2',
      name: 'Puerta Principal',
      cardId: 'B23456',
      status: 'Cerrada',
      date: '30 Jun 2025',
      time: '03:15 PM',
    },
    {
      id: '3',
      name: 'Puerta Este',
      cardId: 'C34567',
      status: 'Abierta',
      date: '01 Jul 2025',
      time: '09:45 AM',
    },
  ]);
  const [newDoorName, setNewDoorName] = useState('');

  const handleViewDetails = (door) => {
    setSelectedDoor(door);
    setModalVisible(true);
  };

  const handleEditName = (door) => {
    setSelectedDoor(door);
    setNewDoorName(door.name);
    setEditModalVisible(true);
  };

  const saveNewName = () => {
    setDoors((prev) =>
      prev.map((d) => (d.id === selectedDoor.id ? { ...d, name: newDoorName } : d))
    );
    setSelectedDoor((prev) => ({ ...prev, name: newDoorName }));
    setEditModalVisible(false);
  };

  const changeStatus = (newStatus) => {
    setDoors((prev) =>
      prev.map((d) => (d.id === selectedDoor.id ? { ...d, status: newStatus } : d))
    );
    setSelectedDoor((prev) => ({ ...prev, status: newStatus }));
  };

  const abrirPuerta = () =>
    selectedDoor.status !== 'Abierta' && changeStatus('Abierta');
  const cerrarPuerta = () =>
    selectedDoor.status !== 'Cerrada' && changeStatus('Cerrada');

  const renderDoorItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardStatus}>ID Tarjeta: {item.cardId}</Text>
          <Text style={styles.cardStatus}>Fecha: {item.date}</Text>
          <Text style={styles.cardStatus}>Hora: {item.time}</Text>
          <Text
            style={[
              styles.cardStatus,
              { color: item.status === 'Abierta' ? colors.success : colors.danger },
            ]}
          >
            Estado: {item.status}
          </Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => handleViewDetails(item)}>
            <Icon name="eye-outline" size={24} color={colors.canela} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEditName(item)}
            style={{ marginLeft: 10 }}
          >
            <Icon name="pencil" size={24} color={colors.canela} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={styles.title}>Gestión de Puertas</Text>
        <Text style={styles.sectionTitle}>Puertas abiertas recientemente</Text>
        <FlatList
          data={doors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoorItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>

      {/* Modal Detalles */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseIconLeft}
              onPress={() => setModalVisible(false)}
            >
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
                    name="card-bulleted"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>ID Tarjeta:</Text>
                  <Text style={styles.userDetailValue}>{selectedDoor.cardId}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon
                    name="calendar"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Fecha:</Text>
                  <Text style={styles.userDetailValue}>{selectedDoor.date}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Hora:</Text>
                  <Text style={styles.userDetailValue}>{selectedDoor.time}</Text>
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
                          selectedDoor.status === 'Abierta'
                            ? colors.success
                            : colors.danger,
                      },
                    ]}
                  >
                    {selectedDoor.status}
                  </Text>
                </View>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      selectedDoor.status === 'Abierta' && styles.disabledButton,
                    ]}
                    onPress={abrirPuerta}
                    disabled={selectedDoor.status === 'Abierta'}
                  >
                    <Text style={styles.modalButtonText}>Abrir Puerta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      selectedDoor.status === 'Cerrada' && styles.disabledButton,
                    ]}
                    onPress={cerrarPuerta}
                    disabled={selectedDoor.status === 'Cerrada'}
                  >
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
                <TouchableOpacity style={styles.modalButton} onPress={saveNewName}>
                  <Icon
                    name="content-save-outline"
                    size={18}
                    color={colors.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setEditModalVisible(false)}
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
    </>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', color: colors.textDark, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textDark },
  cardStatus: { marginTop: 6, fontSize: 14, color: colors.textLight },
  iconGroup: { flexDirection: 'row', alignItems: 'center' },

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
  modalCloseIconLeft: { position: 'absolute', top: 10, left: 10, zIndex: 10 },

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
  userDetailIcon: { marginRight: 12 },
  userDetailLabel: { flex: 0.4, fontSize: 14, color: colors.textLight },
  userDetailValue: { flex: 0.6, fontSize: 15, color: colors.textDark, fontWeight: '600' },

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
