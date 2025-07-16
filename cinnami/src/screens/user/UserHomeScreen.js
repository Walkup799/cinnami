import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';
import { Portal, Modal, Provider} from 'react-native-paper';
import CustomAlert from '../../utils/customAlert';


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

  //estados
    const [userProfile, setUserProfile] = useState(null);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [editProfileMode, setEditProfileMode] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',    // confirmar nueva contraseña 
      });
    const [cardModalVisible, setCardModalVisible] = useState(false);
    const [availableCards, setAvailableCards] = useState([]);
      const [isLoadingCards, setIsLoadingCards] = useState(false);
      const [changePasswordMode, setChangePasswordMode] = useState(false);
      const [errors, setErrors] = useState({});
      const [isLoading, setIsLoading] = useState(false);
    
      const [allCards, setAllCards] = useState([]);
    
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    
      const [authError, setAuthError] = useState({
        visible: false,
        message: ''
      });
    
      // Estados del formulario
        const [formData, setFormData] = useState({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'docente',
          firstName: '',
          lastName: '',
        });



  useEffect(() => {
      const loadUser = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUserProfile(JSON.parse(userData));
        }
      };
      loadUser();
    }, []);

    // Función para mostrar errores de autenticación
  const showAuthError = (message) => {
    setAuthError({
      visible: true,
      message: message || 'Tu sesión ha expirado. Por favor ingresa nuevamente.'
    });
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
  
  //EDITAR PERFIL PROPIO
 const handleSaveProfile = async () => {

  console.log('handleSaveProfile llamado');
  console.log('Valores actuales:', profileForm);
  console.log('Errores actuales:', errors);

  const isValid = validateForm(); 

  if (!isValid) {
    showError('Por favor corrige los errores del formulario');
    return;
  }

  setIsLoading(true);
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = userProfile?._id;

    
    // --- Paso 1: Actualizar datos del usuario (sin password) ---
    const updateResponse = await fetch(`${API_BASE_URL}/${userId}/update`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: profileForm.username,
        email: profileForm.email,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        cardId: profileForm.cardId,
      }),
    });

    const updateData = await updateResponse.json();

    // --- Paso 3: Cambiar contraseña si se solicitó ---
    if (profileForm.password) {
      console.log('Cambiando contraseña...');
      const passRes = await fetch(`${API_BASE_URL}/${userId}/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.password,
        }),
      });

      const passData = await passRes.json();

      if (!passRes.ok) {
        throw new Error(passData.message || 'Error al cambiar la contraseña');
      }
    }

    if (updateResponse.ok) {
      await AsyncStorage.setItem('userData', JSON.stringify(updateData.user));
      setUserProfile(updateData.user);
      setEditProfileMode(false);
      showSuccess('Perfil actualizado correctamente');
    } else {
      showError(updateData.message || 'Error al actualizar perfil');
    }

  } catch (error) {
    showError(error.message || 'Error al guardar los cambios');
    console.error('Error al guardar perfil:', error);
  } finally {
    setIsLoading(false);
  }
};

const validateField = (name, value) => {
  let error = '';

  switch (name) {
    case 'username':
      if (!value.trim()) error = 'Usuario es requerido';
      else if (value.length < 4) error = 'Mínimo 4 caracteres';
      break;
    case 'email':
      if (!value.trim()) error = 'Email es requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
      break;
    case 'password':
      if (!value) error = 'Contraseña es requerida';
      else if (value.length < 6) error = 'Mínimo 6 caracteres';
      break;

    case 'confirmPassword':
      if (value !== profileForm.password) error = 'Las contraseñas no coinciden';
      break;
    case 'firstName':
    case 'lastName':
      if (!value.trim()) error = 'Este campo es requerido';
      break;
  }

  setErrors(prev => ({ ...prev, [name]: error }));
  return !error;
};


// NOSE
 const handleInputChange = (name, value) => {
  setFormData(prev => ({ ...prev, [name]: value }));

  // Validación en tiempo real para estos campos
  if (['email', 'confirmPassword', 'password', 'username'].includes(name)) {
    validateField(name, value);
  }
};



  
  
// validar formulario
  const validateForm = () => {
  const fieldsToValidate = ['username', 'email', 'firstName', 'lastName'];

  const allFieldsValid = fieldsToValidate.every(field => 
    validateField(field, profileForm[field])
  );

  let passwordsValid = true;
  if (profileForm.password || profileForm.confirmPassword) {
    passwordsValid = 
      validateField('password', profileForm.password) &&
      validateField('confirmPassword', profileForm.confirmPassword);
  }

  return allFieldsValid && passwordsValid;
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
  const [selectedUser, setSelectedUser] = useState(null);

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


  useEffect(() => {
    if (!changePasswordMode) {
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
      setErrors(prev => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
    }
  }, [changePasswordMode]);
  

  return (
    <Provider>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>¡Bienvenido, {userProfile?.firstName} !</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <Icon name="account-circle-outline" size={75} color={colors.canela} />
          <View style={{ flex: 1, marginLeft: 28 }}>
            <Text style={styles.profileName}>
              {(userProfile?.firstName || '') + ' ' + (userProfile?.lastName || '')}
            </Text>
            <Text style={styles.profileUsername}>
              @{userProfile?.username || userProfile?.email || ''}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {userProfile?.role === 'admin' ? 'Administrador' : userProfile?.role || ''}
              </Text>
            </View>
            <Text style={styles.profileMeta}>
              Último acceso: {userProfile?.lastLogin || '-'}
            </Text>
          </View>
          <TouchableOpacity
                    style={{ paddingLeft: 10 }}
                    onPress={() => {
                      setProfileForm({
                        firstName: userProfile?.firstName || '',
                        lastName: userProfile?.lastName || '',
                        username: userProfile?.username || '',
                        email: userProfile?.email || '',
                        password: '',
                        confirmPassword: '',
                        cardId: userProfile?.cardId || '',
                      });
                      setEditProfileMode(false);
                      setProfileModalVisible(true);
                    }}
                  >
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
        <View style={styles.modalOverlayAccess}>
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

     
      {/* Modal de perfil */}
      <Modal
        visible={profileModalVisible}
        onDismiss={() => setProfileModalVisible(false)}
        contentContainerStyle={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalCloseIconLeft}
            onPress={() => setProfileModalVisible(false)}
          >
            <Icon name="close" size={24} color={colors.textLight} />
          </TouchableOpacity>
          {!editProfileMode ? (
            <>
              <View style={styles.userModalHeader}>
                <View style={styles.userModalAvatar}>
                  <Icon name="account" size={40} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>
                  {userProfile?.firstName} {userProfile?.lastName}
                </Text>
                <Text style={styles.userModalEmail}>{userProfile?.email}</Text>
                <View style={[
                  styles.userModalRole,
                  userProfile?.role === 'admin' && styles.userRoleAdmin
                ]}>
                  <Text style={styles.userModalRoleText}>
                    {userProfile?.role === 'admin' ? 'Administrador' : userProfile?.role}
                  </Text>
                </View>
              </View>
              <View style={styles.userDetailsContainer}>
                <View style={styles.userDetailRow}>
                  <Icon name="account" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>Usuario:</Text>
                  <Text style={styles.userDetailValue}>{userProfile?.username}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon name="card-account-details" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>Nombres:</Text>
                  <Text style={styles.userDetailValue}>{userProfile?.firstName}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon name="card-account-details" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>Apellidos:</Text>
                  <Text style={styles.userDetailValue}>{userProfile?.lastName}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon name="email" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>Correo:</Text>
                  <Text style={styles.userDetailValue}>{userProfile?.email}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Icon name="account-check" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>Estado:</Text>
                  <Text style={[
                    styles.userDetailValue,
                    userProfile?.status !== false ? styles.activeUser : styles.inactiveUser
                  ]}>
                    {userProfile?.status !== false ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => setEditProfileMode(true)}
                  >
                    <Icon name="pencil" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
              </View>
              </View>
              
            </>
          ) : (
            <ScrollView>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              {[
                { name: 'firstName', label: 'Nombres', icon: 'card-account-details' },
                { name: 'lastName', label: 'Apellidos', icon: 'card-account-details' },
                { name: 'username', label: 'Usuario', icon: 'account' },
                { name: 'email', label: 'Correo', icon: 'email' },
              ].map(field => (
                <View key={field.name} style={styles.inputGroup}>
  <Text style={styles.userDetailLabel}>{field.label}</Text>
  <View style={styles.inputWithIcon}>
    <Icon name={field.icon} size={20} color={colors.textLight} style={styles.userDetailIcon} />
    <TextInput
      style={[styles.editableInput, { borderBottomWidth: 1, borderColor: '#eee' }]}
      value={profileForm[field.name]}
      onChangeText={text => setProfileForm(prev => ({ ...prev, [field.name]: text }))}
    />
  </View>
  {errors[field.name] && (
    <Text style={{ color: 'red', marginLeft: 30, fontSize: 12 }}>
      {errors[field.name]}
    </Text>
  )}
</View>

              ))}
              <TouchableOpacity
                style={styles.togglePasswordButton}
                onPress={() => setChangePasswordMode(prev => !prev)}
              >
                <Text style={styles.togglePasswordText}>
                  {changePasswordMode ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                </Text>
              </TouchableOpacity>

               {changePasswordMode && (
                    <>
                      

                      <View style={styles.userDetailRow}>
                        <Icon name="lock" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                        <Text style={styles.userDetailLabel}>Nueva contraseña:</Text>
                        <TextInput
                          style={[styles.editableInput, { borderBottomWidth: 1, borderColor: '#eee' }]}
                          value={profileForm.password}
                          onChangeText={text => {
                            setProfileForm(prev => {
                              const updatedForm = { ...prev, password: text };
                              validateField('password', text);
                              validateField('confirmPassword', updatedForm.confirmPassword); // Revalida confirmación
                              return updatedForm;
                            });
                          }}

                          secureTextEntry={!showPassword}
                          placeholder="Nueva contraseña"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                        </TouchableOpacity>
                        
                      </View>
                      {errors.password && (
                          <Text style={{ color: 'red', marginLeft: 30, fontSize: 12 }}>
                            {errors.password}
                          </Text>
                        )}

                      <View style={styles.userDetailRow}>
                        <Icon name="lock-check" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                        <Text style={styles.userDetailLabel}>Confirmar contraseña:</Text>
                        <TextInput
                          style={[styles.editableInput, { borderBottomWidth: 1, borderColor: '#eee' }]}
                          value={profileForm.confirmPassword}
                          onChangeText={text => {
                            setProfileForm(prev => ({ ...prev, confirmPassword: text }));
                            validateField('confirmPassword', text);
                          }}

                          secureTextEntry={!showConfirmPassword}
                          placeholder="Confirmar contraseña"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                          <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                        </TouchableOpacity>
                        
                      </View>
                      {errors.confirmPassword && (
                          <Text style={{ color: 'red', marginLeft: 30, fontSize: 12 }}>
                            {errors.confirmPassword}
                          </Text>
                        )}
                    </>
                  )}

                  <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButtonGeneral]}
                        onPress={() => {
                          setEditProfileMode(false);
                          setErrors({}); // Limpia errores
                        }}
                      >
                        <Icon name="close" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSaveProfile}
                      >
                        <Icon name="content-save" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>  
            </ScrollView>
          )}
        </View>
      </Modal>

     

    {/* Modales secundarios en Portal */}
    
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        alertType={alertData.type}
        onClose={hideAlert}
      />

    </Provider>
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
  modalOverlayAccess: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  backgroundColor: 'rgba(0,0,0,0.3)', // para oscurecer el fondo del modal nativo
},
  modalContent: {
  backgroundColor: colors.white,
  borderRadius: 12,
  padding: 20,
  width: '90%',
  maxHeight: '90%',
  alignSelf: 'center',
  elevation: 5,
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

  userDetailValue: {
  flex: 1,
  fontSize: 16,
  color: '#333',
  paddingVertical: 8,
  paddingLeft: 12,
  marginLeft: 6,
  borderLeftWidth: 3,
  borderLeftColor: colors.primary, // usa tu color principal
  backgroundColor: '#f8f8f8',
  borderRadius: 6,
  opacity: 0.95,
  letterSpacing: 0.3,
  fontWeight: '500',
},
  editableInput: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  fontSize: 16,
  color: '#333',
  backgroundColor: '#f9f9f9',
  opacity: 0.9,
},
  activeUser: { color: colors.success },
  inactiveUser: { color: colors.danger },
  //.....................................
  profileCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.white,
  padding: 22,
  borderRadius: 16,
  marginBottom: 22,
  borderWidth: 1,
  borderColor: colors.darkBeige,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
},
profileIconCircle: {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: colors.beige,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 0,
},
profileName: {
  fontSize: 21,
  fontWeight: 'bold',
  color: colors.textDark,
  marginBottom: 2,
},
profileUsername: {
  fontSize: 15,
  color: colors.textLight,
  marginBottom: 6,
},
roleBadge: {
  alignSelf: 'flex-start',
  backgroundColor: colors.canela,
  borderRadius: 14,
  paddingVertical: 4,
  paddingHorizontal: 14,
  marginBottom: 6,
  marginTop: 2,
  shadowColor: colors.primary,
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
},
roleBadgeText: {
  color: colors.white,
  fontWeight: 'bold',
  fontSize: 14,
  letterSpacing: 0.5,
},
profileMeta: {
  fontSize: 13,
  color: colors.textLight,
  marginTop: 2,
},
actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 8,
  marginVertical: 6,
},
editButton: {
  backgroundColor: colors.canela,
},
saveButton: {
  backgroundColor: colors.success,
},
cancelButtonGeneral: {
  backgroundColor: colors.danger,
},
actionButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  marginLeft: 6,
},
modalButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 18,
  gap: 10,
},
cardPickerModalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 50,
  maxHeight: '80%',
  width: '50%',
  minWidth: 280,
  alignSelf: 'center',
  justifyContent: 'flex-start',
  maxHeight: '80%',  
},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 1,
    paddingBottom: 1,
    marginBottom: -10
  },
// ...existing styles...
// ...existing styles...
togglePasswordButton: {
  alignSelf: 'flex-start',
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 30,
},

togglePasswordText: {
  color: colors.primary,
  fontSize: 14,
  fontWeight: '600',
  textDecorationLine: 'underline',
  opacity: 0.85,
},
cardItem: {
  padding: 18,           // Más espacio para el dedo
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  width: '100%',
},
userModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%', // Ocupar todo el ancho disponible
    paddingHorizontal: 5, // Padding para evitar que toque los bordes
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
    fontSize: 13,
    color: colors.textLight,
  },
  inputGroup: {
  marginBottom: 20,
},

inputWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

userDetailLabel: {
  marginBottom: 5,
  fontWeight: 'bold',
  color: colors.textDark,
  fontSize: 14,
},


});

export default UserHomeScreen;