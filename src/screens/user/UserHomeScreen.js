import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const colors = {
  canela: '#D2A679',
  beige: '#F5E6D3',
  white: '#FFFFFF',
  darkBeige: '#E8D5B5',
  textDark: '#000000',
  textLight: '#7A6E5F',
  danger: '#E57373',
  success: '#81C784',
  primary: '#6CA0DC',
};

const UserHomeScreen = () => {
  const userProfile = {
    name: 'Carlos Ruiz',
    role: 'Docente',
    email: 'carlos.ruiz@ejemplo.com',
    lastAccess: '29/06/2025 - 10:30 AM',
  };

  const accessLogs = [
    {
      id: '1',
      door: 'Puerta Principal',
      time: '10:30 AM',
      date: '29 Jun 2025',
      status: 'Acceso permitido',
    },
    {
      id: '2',
      door: 'Puerta Este',
      time: '11:00 AM',
      date: '28 Jun 2025',
      status: 'Acceso denegado',
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState(null);

  const handleShowDetails = (access) => {
    setSelectedAccess(access);
    setModalVisible(true);
  };

  const totalAllowed = accessLogs.filter(log => log.status === 'Acceso permitido').length;
  const totalDenied = accessLogs.filter(log => log.status === 'Acceso denegado').length;
  const totalAccesses = accessLogs.length;

  const renderAccessItem = ({ item }) => (
    <View style={styles.accessItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.accessName}>{item.door}</Text>
        <Text style={styles.accessRole}>Fecha: {item.date}</Text>
        <Text style={styles.accessTime}>Hora: {item.time}</Text>
      </View>
      <TouchableOpacity style={styles.infoButton} onPress={() => handleShowDetails(item)}>
        <Icon name="eye-outline" size={24} color={colors.canela} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>¡Bienvenido, {userProfile.name}!</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <Icon name="account-circle-outline" size={75} color={colors.canela} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileRole}>{userProfile.role}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
            <Text style={styles.profileMeta}>Último acceso: {userProfile.lastAccess}</Text>
          </View>
          <TouchableOpacity style={{ paddingLeft: 10 }}>
            <Icon name="account-cog-outline" size={26} color={colors.canela} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryItem}>
            <Icon name="door-open" size={30} color={colors.success} />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTextTop}>Accesos</Text>
              <Text style={styles.summaryTextBottom}>permitidos</Text>
            </View>
            <Text style={[styles.summaryNumber, { color: colors.success }]}>{totalAllowed}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Icon name="door-closed" size={30} color={colors.danger} />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTextTop}>Accesos</Text>
              <Text style={styles.summaryTextBottom}>denegados</Text>
            </View>
            <Text style={[styles.summaryNumber, { color: colors.danger }]}>{totalDenied}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Icon name="door" size={30} color={colors.canela} />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTextTop}>Total</Text>
              <Text style={styles.summaryTextBottom}>accesos</Text>
            </View>
            <Text style={[styles.summaryNumber, { color: colors.canela }]}>{totalAccesses}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accesos recientes</Text>

        {accessLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="door" size={100} color={colors.darkBeige} />
            <Text style={styles.emptyText}>Aquí se verán los accesos recientes</Text>
          </View>
        ) : (
          <FlatList
            data={accessLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderAccessItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
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

            {selectedAccess && (
              <View style={{ alignItems: 'center' }}>
                <View style={styles.userModalAvatar}>
                  <Icon name="door" size={40} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>{selectedAccess.door}</Text>
                <View style={styles.userDetailsContainer}>
                  <View style={styles.userDetailRow}>
                    <Icon name="calendar" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Fecha:</Text>
                    <Text style={styles.userDetailValue}>{selectedAccess.date}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="clock-outline" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Hora:</Text>
                    <Text style={styles.userDetailValue}>{selectedAccess.time}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="account-check" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Estado:</Text>
                    <Text
                      style={[
                        styles.userDetailValue,
                        selectedAccess.status === 'Acceso permitido' ? styles.activeUser : styles.inactiveUser,
                      ]}
                    >
                      {selectedAccess.status}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.beige },
  welcomeContainer: {
    backgroundColor: colors.canela,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.darkBeige,
    gap: 20,
  },
  profileName: { fontSize: 20, fontWeight: 'bold', color: colors.textDark },
  profileRole: { fontSize: 15, color: colors.textLight, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  profileMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  summaryPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryTextContainer: {
    height: 34,          // controla alto fijo para texto de dos líneas
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  summaryTextTop: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: 'normal',
  },
  summaryTextBottom: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: 'normal',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  accessItem: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.darkBeige,
    borderWidth: 1,
  },
  accessName: { fontSize: 16, fontWeight: 'bold', color: colors.textDark },
  accessRole: { fontSize: 14, color: colors.textLight },
  accessTime: { fontSize: 12, color: colors.canela },
  infoButton: { paddingLeft: 10 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 10,
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
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  userModalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userDetailsContainer: { marginTop: 10, width: '100%' },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 14,
  },
  userDetailIcon: { marginRight: 12 },
  userDetailLabel: {
    flex: 0.4,
    fontSize: 14,
    color: colors.textLight,
  },
  userDetailValue: {
    flex: 0.6,
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '600',
    textAlign: 'left',
  },
  activeUser: { color: colors.success },
  inactiveUser: { color: colors.danger },
});

export default UserHomeScreen;
