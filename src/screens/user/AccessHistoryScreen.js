import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles, colors } from '../../styles/globalStyles';

const AccessHistoryScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState(null);
  const [filter, setFilter] = useState('Todos');

  const [accessHistory, setAccessHistory] = useState([
    { id: 1, door: 'Puerta Principal', time: '10:30 AM', date: '15 Jun 2023', status: 'Exitoso' },
    { id: 2, door: 'Puerta Secundaria', time: '09:15 AM', date: '15 Jun 2023', status: 'Exitoso' },
    { id: 3, door: 'Puerta Principal', time: '04:45 PM', date: '14 Jun 2023', status: 'Exitoso' },
    { id: 4, door: 'Puerta Principal', time: '08:30 AM', date: '14 Jun 2023', status: 'Exitoso' },
    { id: 5, door: 'Puerta Secundaria', time: '06:20 PM', date: '13 Jun 2023', status: 'Fallido' },
  ]);

  // Filtrar historial según filtro activo
  const filteredAccessHistory =
    filter === 'Todos'
      ? accessHistory
      : accessHistory.filter(a => a.status === filter);

  const handleViewDetails = access => {
    setSelectedAccess(access);
    setModalVisible(true);
  };

  const renderAccessItem = (access) => (
    <View key={access.id} style={styles.card}>
      <View style={styles.cardRow}>
        <View>
          <Text style={styles.cardTitle}>{access.door}</Text>
          <Text style={styles.cardStatus}>Fecha: {access.date}</Text>
          <Text style={styles.cardStatus}>Hora: {access.time}</Text>
          <Text
            style={[
              styles.cardStatus,
              { color: access.status === 'Exitoso' ? colors.success : colors.danger },
            ]}>
            Estado: {access.status}
          </Text>
        </View>

        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => handleViewDetails(access)}>
            <Icon name="eye-outline" size={24} color={colors.canela} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={styles.title}>Mi Historial de Accesos</Text>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          {['Todos', 'Exitoso', 'Fallido'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                {f === 'Exitoso' ? 'Exitosos' : f === 'Fallido' ? 'Fallidos' : 'Todos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de accesos filtrados */}
        {filteredAccessHistory.length === 0 ? (
          <View style={styles.noAccessContainer}>
            <Icon name="door" size={60} color={colors.canela} />
            <Text style={styles.noAccessText}>Aquí se verán los accesos recientes</Text>
          </View>
        ) : (
          filteredAccessHistory.map(access => renderAccessItem(access))
        )}
      </ScrollView>

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

            {selectedAccess && (
              <>
                <View style={styles.modalHeader}>
                  <Icon name="door" size={40} color={colors.primary} />
                  <Text style={styles.subtitle}>{selectedAccess.door}</Text>
                </View>

                <View style={styles.userDetailRow}>
                  <Icon
                    name="calendar"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Fecha:</Text>
                  <Text style={styles.userDetailValue}>{selectedAccess.date}</Text>
                </View>

                <View style={styles.userDetailRow}>
                  <Icon
                    name="clock-outline"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Hora:</Text>
                  <Text style={styles.userDetailValue}>{selectedAccess.time}</Text>
                </View>

                <View style={styles.userDetailRow}>
                  <Icon
                    name="check-circle-outline"
                    size={20}
                    color={colors.textLight}
                    style={styles.userDetailIcon}
                  />
                  <Text style={styles.userDetailLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.userDetailValue,
                      {
                        color:
                          selectedAccess.status === 'Exitoso' ? colors.success : colors.danger,
                      },
                    ]}>
                    {selectedAccess.status}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', color: colors.textDark, marginBottom: 15 },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.canela,
    width: '30%',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: colors.canela,
  },
  filterText: {
    color: colors.canela,
  },
  activeFilterText: {
    color: colors.white,
  },

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

  noAccessContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noAccessText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textLight,
  },
});

export default AccessHistoryScreen;
