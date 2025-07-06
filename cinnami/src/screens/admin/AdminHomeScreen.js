import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';
import { Portal, Modal, Provider} from 'react-native-paper';
import CustomAlert from '../../utils/customAlert';

const AdminHomeScreen = () => {

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
      cardId: ''
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

   // funcion global para obtener TODAS las tarjetas
    const loadAllCards = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener todas las tarjetas');
      const data = await response.json();
      setAllCards(data.cards || []);
    } catch (error) {
      console.error('Error al cargar todas las tarjetas:', error);
    }
  };

  useEffect(() => {
  loadAllCards();
}, []);


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

    // --- Paso 1: Desasignar tarjeta anterior si cambió ---
    const prevCard = allCards.find(card => card.uid === userProfile.cardId);
    const prevCardId = prevCard ? prevCard._id : null;

    if (userProfile.cardId !== profileForm.cardId && prevCardId) {
      await fetch(`${API_BASE_URL}/cards/${prevCardId}/unassign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });
    }

    // --- Paso 2: Actualizar datos del usuario (sin password) ---
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

    // --- Paso 4: Asignar nueva tarjeta si cambió ---
    const newCard = availableCards.find(card => card.uid === profileForm.cardId);
    if (userProfile.cardId !== profileForm.cardId && newCard?._id) {
      await fetch(`${API_BASE_URL}/cards/${newCard._id}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });
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
    case 'cardId':
      if (!value.trim()) error = 'ID de tarjeta es requerido';
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
  const fieldsToValidate = ['username', 'email', 'firstName', 'lastName', 'cardId'];

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





//tarjetas disponibles
const fetchAvailableCards = async () => {
 try {
     setIsLoadingCards(true);
     const token = await AsyncStorage.getItem('userToken');
     const response = await fetch(`${API_BASE_URL}/cards/available`, {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     
     if (!response.ok) {
       throw new Error('Error al obtener tarjetas');
     }
     
     const data = await response.json();
     setAvailableCards(data.cards || []);
   } catch (error) {
     console.error('Error loading cards:', error);
     Alert.alert('Error', 'No se pudieron cargar las tarjetas disponibles');
   } finally {
     setIsLoadingCards(false);
   }
};
 
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.profileCard}>
        <View style={styles.profileIconCircle}>
          <Icon name="account-circle" size={60} color={colors.canela} />
        </View>
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
            Último acceso: {userProfile?.lastAccess || '-'}
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

    {/* Modal de detalle de usuario  */}
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

    {/* Modales secundarios en Portal */}
    <Portal>
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
                <View key={field.name} style={styles.userDetailRow}>
                  <Icon name={field.icon} size={20} color={colors.textLight} style={styles.userDetailIcon} />
                  <Text style={styles.userDetailLabel}>{field.label}:</Text>
                  <TextInput
                    style={[styles.editableInput, { borderBottomWidth: 1, borderColor: '#eee' }]}
                    value={profileForm[field.name]}
                    onChangeText={text => setProfileForm(prev => ({ ...prev, [field.name]: text }))}
                  />
                   {errors[field.name] && (
                      <Text style={{ color: 'red', marginLeft: 30, fontSize: 12 }}>
                        {errors[field.name]}
                      </Text>
                    )}
                </View>
              ))}
              <View style={styles.userDetailRow}>
                <Icon name="card-bulleted" size={20} color={colors.textLight} style={styles.userDetailIcon} />
                <Text style={styles.userDetailLabel}>Tarjeta:</Text>
                <TouchableOpacity
                  style={styles.cardSelectButton}
                  onPress={() => {
                    fetchAvailableCards();
                    setCardModalVisible(true);
                  }}
                >
                  <Text style={styles.cardSelectText}>
                    {profileForm.cardId ? profileForm.cardId : 'Seleccionar'}
                  </Text>
                  <Icon name="chevron-down" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
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

      {/* Modal de selección de tarjeta */}
      <Modal
        visible={cardModalVisible}
        onDismiss={() => setCardModalVisible(false)}
        contentContainerStyle={styles.modalOverlay}
      >
        <View style={styles.cardPickerModalContent}>
          <Text style={styles.modalTitle}>Tarjetas Disponibles</Text>
          {availableCards.length === 0 ? (
            <Text style={styles.emptyText}>No hay tarjetas disponibles</Text>
          ) : (
            <FlatList
              style={{ height: 300 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={availableCards}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cardItem}
                  onPress={() => {
                    setProfileForm(prev => ({ ...prev, cardId: item.cardId || item.uid }));
                    setCardModalVisible(false);
                  }}
                >
                  <Text style={styles.cardText}>UID: {item.cardId || item.uid}</Text>
                  {item.issueDate && (
                    <Text style={styles.cardDate}>
                      Creada: {new Date(item.issueDate).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCardModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
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
  // ...existing styles...
// ...existing styles...
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
    padding: 20,
    paddingBottom: 2,
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

});


export default AdminHomeScreen; 