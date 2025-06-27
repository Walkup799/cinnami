import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminHomeScreen = () => {
  const peopleCount = 1245;
  const doorStatus = 'Abierta';

  const accessLogs = [
    {
      id: '1',
      username: 'ana.gomez',
      name: 'Ana Gómez',
      role: 'Docente',
      time: '08:15 AM',
      door: 'Puerta Norte',
      email: 'ana.gomez@ejemplo.com',
      firstName: 'Ana',
      lastName: 'Gómez',
      cardId: 'A12345',
      status: 'Activo',
    },
    {
      id: '2',
      username: 'luis.torres',
      name: 'Luis Torres',
      role: 'Administrador',
      time: '08:20 AM',
      door: 'Puerta Principal',
      email: 'luis.torres@ejemplo.com',
      firstName: 'Luis',
      lastName: 'Torres',
      cardId: 'B23456',
      status: 'Inactivo',
    },
    {
      id: '3',
      username: 'maria.lopez',
      name: 'María López',
      role: 'Estudiante',
      time: '08:25 AM',
      door: 'Puerta Este',
      email: 'maria.lopez@ejemplo.com',
      firstName: 'María',
      lastName: 'López',
      cardId: 'C34567',
      status: 'Activo',
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderAccessItem = ({ item }) => (
    <View style={styles.accessItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.accessName}>{item.name}</Text>
        <Text style={styles.accessRole}>Rol: {item.role}</Text>
        <Text style={styles.accessTime}>Hora: {item.time}</Text>
      </View>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => handleShowDetails(item)}
      >
        <Icon name="eye-outline" size={24} color={colors.canela} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
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

        <View style={styles.summaryCard}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Personas ingresadas</Text>
            <Text style={styles.summaryValue}>{peopleCount}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Estado de puerta</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: doorStatus === 'Abierta' ? colors.success : colors.danger },
              ]}
            >
              {doorStatus}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accesos recientes</Text>
        <FlatList
          data={accessLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderAccessItem}
          scrollEnabled={false}
        />
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

            {selectedUser && (
              <ScrollView>
                <View style={styles.userModalHeader}>
                  <View style={styles.userModalAvatar}>
                    <Icon name="account" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                  <Text style={styles.userModalEmail}>{selectedUser.email}</Text>
                  <View
                    style={[
                      styles.userModalRole,
                      selectedUser.role === 'Administrador' && styles.userRoleAdmin,
                    ]}
                  >
                    <Text style={styles.userModalRoleText}>{selectedUser.role}</Text>
                  </View>
                </View>

                <View style={styles.userDetailsContainer}>
                  <View style={styles.userDetailRow}>
                    <Icon name="account" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Usuario:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.username}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="email" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Correo:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="card-account-details" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Nombres:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.firstName}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="card-account-details" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Apellidos:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.lastName}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="card-bulleted" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>ID Tarjeta:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.cardId}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="door" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Puerta:</Text>
                    <Text style={styles.userDetailValue}>{selectedUser.door}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Icon name="account-check" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                    <Text style={styles.userDetailLabel}>Estado:</Text>
                    <Text
                      style={[
                        styles.userDetailValue,
                        selectedUser.status === 'Activo' ? styles.activeUser : styles.inactiveUser,
                      ]}
                    >
                      {selectedUser.status}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.beige },
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
  profileImage: { width: 75, height: 75, borderRadius: 40 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: colors.textDark },
  profileRole: { fontSize: 15, color: colors.textLight, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  profileMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  summaryBox: { flex: 1, alignItems: 'center' },
  separator: { width: 1, backgroundColor: colors.darkBeige, marginHorizontal: 10 },
  summaryLabel: { color: colors.textLight, marginBottom: 5 },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: colors.canela },
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
  userModalHeader: { alignItems: 'center', marginBottom: 20 },
  userModalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userModalEmail: { fontSize: 14, color: colors.textLight },
  userModalRole: {
    backgroundColor: '#A8C7F7', // azul pastel
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  userRoleAdmin: {
    backgroundColor: '#A8C7F7', // azul pastel
  },
  userModalRoleText: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
  userDetailsContainer: { marginTop: 10 },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 14,
  },
  userDetailIcon: {
    marginRight: 12,
  },
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

const userProfile = {
  name: 'Juan Pérez',
  role: 'Administrador',
  image: 'https://i.pravatar.cc/100?img=12',
  email: 'juan.perez@ejemplo.com',
  lastAccess: '25/06/2025 - 08:10 AM',
};

export default AdminHomeScreen; 