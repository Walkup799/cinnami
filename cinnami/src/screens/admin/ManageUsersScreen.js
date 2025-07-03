import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard, Alert, FlatList,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal, Portal, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';
import CustomAlert from '../../utils/customAlert';
import AuthErrorModal from '../../utils/AuthErrorModal';
import { logoutUser } from '../../utils/authHelpers';



const ManageUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editSuccessModal, setEditSuccessModal] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [disableSuccessModal, setDisableSuccessModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  //news

  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [availableCards, setAvailableCards] = useState([]);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);


  const [allCards, setAllCards] = useState([]);
    

  const [authError, setAuthError] = useState({
    visible: false,
    message: ''
  });

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

  // Función para mostrar errores de autenticación
  const showAuthError = (message) => {
    setAuthError({
      visible: true,
      message: message || 'Tu sesión ha expirado. Por favor ingresa nuevamente.'
    });
  };

  // Función para manejar logout
  const handleLogout = async () => {
    try {
      await logoutUser(setUserRole);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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


   // Función para abrir el modal con los datos del usuario
  const openUserModal = (user) => {
    console.log("Datos del usuario recibidos:", user); 
    setSelectedUser(user);
    setUserModalVisible(true);
    setEditMode(false);
  };

 

// Función para abrir modal de confirmación
const confirmDisableUser = () => {
  setConfirmModalVisible(true);
};

// Función para deshabilitar usuario
const disableUser = async () => {
  setIsLoading(true);
  setConfirmModalVisible(false); // Cerrar modal de confirmación
  
  try {
    const token = await AsyncStorage.getItem('userToken');
    const prevCard = allCards.find(card => card.uid === selectedUser.cardId);
    const prevCardId = prevCard ? prevCard._id : null;
    if (prevCardId) {
      await fetch(`${API_BASE_URL}/cards/${prevCardId}/unassign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });
    }
    //deshabilitar usuario
    const response = await fetch(`${API_BASE_URL}/${selectedUser._id}/disable`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: false }),
    });

    if (response.ok) {
      // Actualizar el estado local
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id ? { ...user, status: false } : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setDisableSuccessModal(true); // Mostrar modal de éxito
      setUserModalVisible(false);
      await loadAllCards(); // Refresca tarjetas
      await loadUsers(); // Refresca usuarios
    } else {
      const data = await response.json();
      showError(data.message || 'Error al deshabilitar usuario');
    }
  } catch (error) {
    showError('Error de conexión');
  } finally {
    setIsLoading(false);
  }
};

const handleSaveChanges = async () => {
  let isValid = true;
  const fieldsToValidate = ['username', 'email', 'firstName', 'lastName', 'cardId'];
  fieldsToValidate.forEach(field => {
    if (!validateField(field, formData[field])) {
      isValid = false;
    }
  });
  if (!isValid) {
    showError('Por favor corrige los errores en el formulario');
    return;
  }

  setIsLoading(true);
  try {
    const token = await AsyncStorage.getItem('userToken');

    // 1. Buscar el _id de la tarjeta anterior usando el UID viejo
    const prevCard = allCards.find(card => card.uid === selectedUser.cardId);
    const prevCardId = prevCard ? prevCard._id : null;

    console.log('selectedUser.cardId:', selectedUser.cardId, typeof selectedUser.cardId);
    console.log('formData.cardId:', formData.cardId, typeof formData.cardId);
    console.log('prevCardId:', prevCardId);

    // 2. Si cambió la tarjeta, desasigna la anterior primero
    if (selectedUser.cardId !== formData.cardId && prevCardId) {
      await fetch(`${API_BASE_URL}/cards/${prevCardId}/unassign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });
    }

     // 3. Actualiza el usuario con el nuevo UID
    const response = await fetch(`${API_BASE_URL}/${selectedUser._id}/update`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        cardId: formData.cardId, // Nuevo UID
        role: formData.role
      }),
    });

    const data = await response.json();

     // 4. Asigna la nueva tarjeta (opcional)
    const newCard = availableCards.find(card => card.uid === formData.cardId);
    if (selectedUser.cardId !== formData.cardId && newCard?._id) {
      await fetch(`${API_BASE_URL}/cards/${newCard._id}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: selectedUser._id }),
      });
    }

    if (response.ok) {
      // ...actualiza estado local, muestra modal de éxito, etc...
      setEditSuccessModal(true);
      setEditMode(false);
      setUserModalVisible(false); 
      await loadUsers();
      await loadAllCards();
    } else {
      showError(data.message || 'Error al actualizar usuario');
    }
  } catch (error) {
    showError('Error de conexión al guardar cambios');
  } finally {
    setIsLoading(false);
  }
};


// Función para entrar en modo edición
  const enterEditMode = () => {
    setFormData({
      username: selectedUser.username,
      email: selectedUser.email,
      password: '', // Dejar en blanco para no sobreescribir sin querer
      confirmPassword: '',
      role: selectedUser.role,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      cardId: selectedUser.cardId
    });
    setEditMode(true);
  };

  
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

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    cardId: ''
  });

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers();
    loadAllCards();
  }, []);
  

  // Filtrar usuarios cuando cambia el texto de búsqueda
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  // Obtener ID del usuario logeado
  useEffect(() => {
    const getCurrentUser = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { _id } = JSON.parse(userData);
        setCurrentUserId(_id);
      }
    };
    getCurrentUser();
  }, []);


 const loadAvailableCards = async () => {
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

// Llama esta función cuando se muestre el formulario
useEffect(() => {
  if (showForm) {
    loadAvailableCards();
  }
}, [showForm]);

// Llama esta función cuando se muestre el formulario
useEffect(() => {
  if (showForm) {
    loadAvailableCards();
  }
}, [showForm]);

const loadUsers = async () => {
  setIsLoading(true);
  try {
    // 1. Obtener usuario actual
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      console.log('No hay datos de usuario en AsyncStorage');
      return;
    }
    
    const currentUser = JSON.parse(userData);
    console.log('Usuario actual desde storage:', currentUser);
    
    if (!currentUser._id) {
      console.log('El usuario actual no tiene _id:', currentUser);
      return;
    }

    // 2. Obtener token
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log('No se encontró token');
      return;
    }

    // 3. Fetch usuarios
    const response = await fetch(`${API_BASE_URL}/all-users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cargar usuarios');
    }

    const data = await response.json();
    console.log('Usuarios recibidos:', data.users);

    // 4. Filtrar usuarios
    const filtered = data.users.filter(user => {
      // Comparar con el _id guardado en AsyncStorage
      return user._id !== currentUser._id && user.status !== false;
    });

    console.log('Usuarios filtrados:', filtered);
    
    setUsers(filtered);
    setFilteredUsers(filtered);

  } catch (error) {
    console.error('Error en loadUsers:', error);
    if (error.message.includes('token expirado') || 
          error.message.includes('No hay token')) {
        showAuthError(error.message);
      } else {
        // Usa tu alerta normal para otros errores
        showError(error.message);
      }
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
        if (value !== formData.password) error = 'Las contraseñas no coinciden';
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

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real para algunos campos
    if (name === 'email' || name === 'confirmPassword') {
      validateField(name, value);
    }
  };


  
  

  const validateForm = () => {
    let isValid = true;
    const fieldsToValidate = ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName', 'cardId'];
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

 const handleSaveUser = async () => {
  Keyboard.dismiss();
  if (!validateForm()) return;

  setIsLoading(true);
  
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    // 1. Preparar datos (sin confirmPassword)
    const { confirmPassword, ...userData } = formData;
    const userToCreate = {
      ...userData,
      cardId: selectedCard?.uid // Usamos el uid de la tarjeta seleccionada
    };

    // 2. Crear usuario
    const userResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userToCreate),
    });

    const responseData = await userResponse.json(); // Respuesta del servidor
    console.log('Respuesta del servidor:', responseData); 

    // 3. Extraer el ID del usuario correctamente (aquí está la línea clave)
    const userId = responseData.user._id; // ← Aquí accedemos al _id dentro de "user"
    console.log('ID del usuario creado:', userId); // Verifica que obtienes el ID 
    if (!userResponse.ok || !userId) {
      throw new Error(responseData.message || 'Error al crear usuario: ID no recibido');
    }

    // 4. Asignar tarjeta si existe
    if (selectedCard) {
      const assignResponse = await fetch(`${API_BASE_URL}/cards/${selectedCard._id}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }), // Usamos el userId extraído
      });

       // Éxito
    setModalVisible(true);
    resetForm();
    loadUsers();
    loadAvailableCards();
    }

   

  } catch (error) {
     console.error('Error completo:', error);
     showError(error.message || 'Error al guardar usuario');
   
  } finally {
    setIsLoading(false);
  }
};

const loadAvailableCardsForEdit = async () => {
  try {
    setIsLoadingCards(true);
    const token = await AsyncStorage.getItem('userToken');
    // Incluye la tarjeta actual en la consulta
    const response = await fetch(
      `${API_BASE_URL}/cards/available?include=${formData.cardId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error('Error al obtener tarjetas');
    const data = await response.json();
    setAvailableCards(data.cards || []);
  } catch (error) {
    Alert.alert('Error', 'No se pudieron cargar las tarjetas disponibles');
  } finally {
    setIsLoadingCards(false);
  }
};

const resetForm = () => {
  setFormData({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'docente',
    firstName: '',
    lastName: '',
    cardId: ''
  });
  setErrors({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    cardId: ''
  });
  setSelectedCard(null);
};

  return (
    <Provider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              if (!showForm) {
                resetForm(); // Vacía el formulario solo al abrir
                setSelectedCard(null);
              }
              setShowForm(!showForm);
            }}
          >
            <Icon 
              name={showForm ? 'close' : 'plus'} 
              size={22} 
              color="white" 
            />
            <Text style={styles.addButtonText}>
              {showForm ? 'Cancelar' : 'Nuevo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Formulario */}
        {showForm && (
          <ScrollView 
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>Información del Usuario</Text>
            
            {/* Inputs del formulario con validación */}
            {[
              { name: 'username', label: 'Nombre de usuario', icon: 'account' },
              { name: 'email', label: 'Correo electrónico', icon: 'email', keyboardType: 'email-address' },
              { name: 'firstName', label: 'Nombres', icon: 'card-account-details' },
              { name: 'lastName', label: 'Apellidos', icon: 'card-account-details' },
              
            ].map((field) => (
              <View key={field.name} style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Icon name={field.icon} size={18} color={colors.textLight} />
                  <Text style={styles.labelText}>{field.label}</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors[field.name] && styles.inputError
                  ]}
                  value={formData[field.name]}
                  onChangeText={(text) => handleInputChange(field.name, text)}
                  onBlur={() => validateField(field.name, formData[field.name])}
                  keyboardType={field.keyboardType || 'default'}
                />
                {errors[field.name] && (
                  <Text style={styles.errorText}>{errors[field.name]}</Text>
                )}
              </View>
            ))}
            {/* Nuevo campo para selección de tarjeta (REEMPLAZO DEL CARD_ID) */}
      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <Icon name="card-bulleted" size={18} color={colors.textLight} />
          <Text style={styles.labelText}>Tarjeta Asignada</Text>
        </View>
        
        {/* Selector de tarjetas */}
        <TouchableOpacity 
          style={[
            styles.input,
            styles.cardSelector,
            errors.cardId && styles.inputError
          ]}
          onPress={() => setShowCardPicker(true)}
        >
          <Text style={formData.cardId ? {} : {color: colors.textLight}}>
            {formData.cardId || 'Seleccione una tarjeta disponible...'}
          </Text>
        </TouchableOpacity>

        

        {errors.cardId && (
          <Text style={styles.errorText}>{errors.cardId}</Text>
        )}
      </View>


            {/* Contraseñas */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Icon name="lock" size={18} color={colors.textLight} />
                <Text style={styles.labelText}>Contraseña</Text>
              </View>
              <View style={[
                styles.passwordInputContainer,
                errors.password && styles.inputError
              ]}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!passwordVisible}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  onBlur={() => validateField('password', formData.password)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Icon 
                    name={passwordVisible ? 'eye-off' : 'eye'} 
                    size={22} 
                    color={colors.textLight} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Icon name="lock-check" size={18} color={colors.textLight} />
                <Text style={styles.labelText}>Confirmar Contraseña</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError
                ]}
                secureTextEntry={!passwordVisible}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Rol */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Icon name="account-supervisor" size={18} color={colors.textLight} />
                <Text style={styles.labelText}>Rol del Usuario</Text>
              </View>
              <View style={styles.roleContainer}>
                {['docente', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive
                    ]}
                    onPress={() => handleInputChange('role', role)}
                  >
                    <Text style={[
                      styles.roleText,
                      formData.role === role && styles.roleTextActive
                    ]}>
                      {role === 'docente' ? 'Docente' : 'Administrador'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Icon name="content-save" size={20} color="white" />
                    <Text style={styles.buttonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>

              
            </View>
          </ScrollView>
        )}

        {/* Lista de usuarios */}
        {!showForm && (
          <ScrollView style={styles.listContainer}>
            {filteredUsers.map((user) => (
              <TouchableOpacity 
                key={user._id} 
                style={styles.userCard}
                onPress={() => openUserModal(user)}
              >
                <View style={styles.userAvatar}>
                  <Icon name="account" size={30} color={colors.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={[
                    styles.userRole,
                    user.role === 'admin' && styles.userRoleAdmin
                  ]}>
                    <Text style={styles.userRoleText}>
                      {user.role === 'docente' ? 'Docente' : 'Administrador'}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Modal de éxito */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Icon name="check-circle" size={60} color={colors.success} />
              </View>
              <Text style={styles.modalTitle}>¡Usuario creado!</Text>
              <Text style={styles.modalText}>
                El usuario ha sido registrado exitosamente en el sistema.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>


        {/* Nuevo modal para detalles de usuario */}
        <Portal>
          <Modal
            visible={userModalVisible}
            onDismiss={() => setUserModalVisible(false)}
            contentContainerStyle={styles.userModalContainer}
          >
            <View style={styles.userModalContent}>
               <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setUserModalVisible(false)}
              >
                <Icon name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>


              {editMode ? (
                <>
                <ScrollView contentContainerStyle={styles.editScrollContainer} >
                  <Text style={styles.userModalTitle}>Editar Usuario</Text>
                  
                  {/* Formulario de edición similar al de creación */}
                  {[
                    { name: 'username', label: 'Nombre de usuario', icon: 'account' },
                    { name: 'email', label: 'Correo electrónico', icon: 'email', keyboardType: 'email-address' },
                    { name: 'firstName', label: 'Nombres', icon: 'card-account-details' },
                    { name: 'lastName', label: 'Apellidos', icon: 'card-account-details' },
                  ].map((field) => (
                    <View key={field.name} style={styles.inputContainer}>
                      <View style={styles.inputLabel}>
                        <Icon name={field.icon} size={18} color={colors.textLight} />
                        <Text style={styles.labelText}>{field.label}</Text>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          errors[field.name] && styles.inputError
                        ]}
                        value={formData[field.name]}
                        onChangeText={(text) => handleInputChange(field.name, text)}
                        onBlur={() => validateField(field.name, formData[field.name])}
                        keyboardType={field.keyboardType || 'default'}
                      />
                      {errors[field.name] && (
                        <Text style={styles.errorText}>{errors[field.name]}</Text>
                      )}
                    </View>
                  ))}


                  {/* Campo de tarjeta como selector */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Icon name="card-bulleted" size={18} color={colors.textLight} />
                      <Text style={styles.labelText}>Tarjeta Asignada</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        styles.cardSelector,
                        errors.cardId && styles.inputError
                      ]}
                     onPress={() => {
                        if (editMode) {
                          loadAvailableCardsForEdit();
                        } else {
                          loadAvailableCards();
                        }
                        setShowCardPicker(true);
                      }}
                    >
                      <Text style={formData.cardId ? {} : { color: colors.textLight }}>
                        {formData.cardId || 'Seleccione una tarjeta disponible...'}
                      </Text>
                    </TouchableOpacity>
                    {errors.cardId && (
                      <Text style={styles.errorText}>{errors.cardId}</Text>
                    )}
                  </View>

                  {/* Rol */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Icon name="account-supervisor" size={18} color={colors.textLight} />
                      <Text style={styles.labelText}>Rol del Usuario</Text>
                    </View>
                    <View style={styles.roleContainer}>
                      {['docente', 'admin'].map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={[
                            styles.roleButton,
                            formData.role === role && styles.roleButtonActive
                          ]}
                          onPress={() => handleInputChange('role', role)}
                        >
                          <Text style={[
                            styles.roleText,
                            formData.role === role && styles.roleTextActive
                          ]}>
                            {role === 'docente' ? 'Docente' : 'Administrador'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Botones de edición */}
                   <View style={styles.editButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.halfWidthButton, styles.cancelEditButton]}
                      onPress={() => setEditMode(false)}
                      disabled={isLoading}
                    >
                      <Text style={styles.halfWidthButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.halfWidthButton, styles.saveEditButton]}
                      onPress={handleSaveChanges}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.halfWidthButtonText}>Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                </ScrollView>

            <Portal>
              <Modal
                visible={showCardPicker}
                onDismiss={() => setShowCardPicker(false)}
                contentContainerStyle={styles.modalOverlay}
              >
                <View style={styles.cardPickerModalContent}>
                  <Text style={styles.modalTitle}>Tarjetas Disponibles</Text>
                  {isLoadingCards ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : availableCards.length === 0 ? (
                    <Text style={styles.emptyText}>No hay tarjetas disponibles</Text>
                  ) : (
                    <FlatList
                      style={{height: 300}}
                      contentContainerStyle={{paddingBottom: 20}}
                      data={availableCards}
                      keyExtractor={item => item._id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.cardItem}
                          onPress={() => {
                            handleInputChange('cardId', item.uid);
                            setSelectedCard(item);
                            setShowCardPicker(false);
                          }}
                        >
                          <Text style={styles.cardText}>UID: {item.uid}</Text>
                          <Text style={styles.cardDate}>
                            Creada: {new Date(item.issueDate).toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowCardPicker(false)}
                  >
                    <Text style={{ color: colors.text }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </Portal> 

            </>
                
              ) : (
                
                <>
                  <View style={styles.userModalHeader}>
                    <View style={styles.userModalAvatar}>
                      <Icon name="account" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.userModalName}>
                      {selectedUser?.firstName} {selectedUser?.lastName}
                    </Text>
                    <Text style={styles.userModalEmail}>{selectedUser?.email}</Text>
                    <View style={[
                      styles.userModalRole,
                      selectedUser?.role === 'admin' && styles.userRoleAdmin
                    ]}>
                      <Text style={styles.userModalRoleText}>
                        {selectedUser?.role === 'docente' ? 'Docente' : 'Administrador'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userDetailsContainer}>
                    <View style={styles.userDetailRow}>
                      <Icon name="account" size={20} color={colors.textLight} />
                      <Text style={styles.userDetailLabel}>Usuario:</Text>
                      <Text style={styles.userDetailValue}>{selectedUser?.username}</Text>
                    </View>
                    <View style={styles.userDetailRow}>
                      <Icon name="card-account-details" size={20} color={colors.textLight} />
                      <Text style={styles.userDetailLabel}>ID Tarjeta:</Text>
                      <Text style={styles.userDetailValue}>{selectedUser?.cardId}</Text>
                    </View>
                    <View style={styles.userDetailRow}>
                      <Icon name="calendar" size={20} color={colors.textLight} />
                      <Text style={styles.userDetailLabel}>Registrado:</Text>
                      <Text style={styles.userDetailValue}>
                        {new Date(selectedUser?.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.userDetailRow}>
                      <Icon name="account-check" size={20} color={colors.textLight} />
                      <Text style={styles.userDetailLabel}>Estado:</Text>
                      <Text style={[
                        styles.userDetailValue,
                        selectedUser?.status !== false ? styles.activeUser : styles.inactiveUser
                      ]}>
                        {selectedUser?.status  !== false ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={enterEditMode}
                    >
                      <Icon name="pencil" size={18} color="white" />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.disableButtonGeneral]}
                      onPress={confirmDisableUser}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Icon name="account-remove" size={18} color="white" />
                          <Text style={styles.actionButtonText}>Deshabilitar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Modal>

           <Modal
            visible={editSuccessModal}
            onDismiss={() => setEditSuccessModal(false)}
            contentContainerStyle={styles.editSuccessModal}
          >
            <View style={styles.editSuccessContent}>
              <View style={styles.editSuccessIcon}>
                <Icon name="check-circle" size={50} color={colors.success} />
              </View>
              <Text style={styles.editSuccessTitle}>¡Cambios guardados!</Text>
              <Text style={styles.editSuccessText}>
                La información del usuario se ha actualizado correctamente.
              </Text>
              <TouchableOpacity
                style={styles.editSuccessButton}
                onPress={async () => {
                  setEditSuccessModal(false);
                  setUserModalVisible(false); // Cierra el modal de usuario
                  await loadUsers();
                  await loadAllCards();
                }}
              >
                <Text style={styles.editSuccessButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Modal de Confirmación para Deshabilitar */}


           <Modal
          visible={confirmModalVisible}
          onDismiss={() => setConfirmModalVisible(false)}
          contentContainerStyle={styles.confirmModalContainer}
        >
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmModalHeader}>
              <Icon name="alert-circle" size={40} color={colors.warning} />
              <Text style={styles.confirmModalTitle}>Confirmar Deshabilitación</Text>
            </View>
            
            <Text style={styles.confirmModalTitle}>
              ¿Estás seguro que deseas deshabilitar a {selectedUser?.firstName} {selectedUser?.lastName}?
            </Text>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.confirmModalButtonText, styles.modalCancelButton]}
                onPress={() => setConfirmModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.confirmModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmModalButtonText, styles.modalDisableButton]}
                onPress={disableUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Deshabilitar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
         </Modal>


         {/* Modal de Éxito al Deshabilitar */}

          <Modal
            visible={disableSuccessModal}
            onDismiss={() => setDisableSuccessModal(false)}
            contentContainerStyle={styles.successModalContainer}
          >
            <View style={styles.successModalContent}>
              <View style={styles.successModalIcon}>
                <Icon name="check-circle" size={50} color={colors.success} />
              </View>
              <Text style={styles.successModalTitle}>¡Usuario Deshabilitado!</Text>
              <Text style={styles.successModalText}>
                {selectedUser?.firstName} {selectedUser?.lastName} ha sido deshabilitado correctamente.
              </Text>
              <TouchableOpacity
                style={styles.successModalButton}
                onPress={() => setDisableSuccessModal(false)}
              >
                <Text style={styles.successModalButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </Modal> 
        </Portal>

        
        {/* Modal de selección de tarjeta */}
        <Portal>
  <Modal
    visible={showCardPicker}
    onDismiss={() => setShowCardPicker(false)}
    contentContainerStyle={styles.modalOverlay}
  >
    <View style={styles.cardPickerModalContent}>
      <Text style={styles.modalTitle}>Tarjetas Disponibles</Text>
      {isLoadingCards ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : availableCards.length === 0 ? (
        <Text style={styles.emptyText}>No hay tarjetas disponibles</Text>
      ) : (
        <FlatList
          style={{height: 300}}
          contentContainerStyle={{paddingBottom: 20}}
          data={availableCards}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => {
                handleInputChange('cardId', item.uid);
                setSelectedCard(item);
                setShowCardPicker(false);
              }}
            >
              <Text style={styles.cardText}>UID: {item.uid}</Text>
              <Text style={styles.cardDate}>
                Creada: {new Date(item.issueDate).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowCardPicker(false)}
      >
        <Text style={{ color: colors.text }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </Modal>
</Portal>

        
      </View>

      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        alertType={alertData.type}
        onClose={hideAlert}
      />

       <AuthErrorModal
        visible={authError.visible}
        message={authError.message}
        onClose={() => {
          setAuthError({ visible: false, message: '' });
          handleLogout();
        }}
        onLogout={handleLogout}
      />
    </Provider>
  );
};

// Paleta de colores profesional
const colors = {
  primary: '#D2A679',       
  secondary: '#E8D5B5',     
  accent: '#E8D5B5',        
  background: '#F5E6D3',    
  card: '#FFFFFF',          
  text: '#212529',          
  textLight: '#6C757D',     
  error: '#EF233C',         
  success: '#4BB543',       
  warning: '#FFD166',       
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formContent: {
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: colors.text,
  },
  eyeButton: {
    padding: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    color: colors.text,
  },
  roleTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 25,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    maxHeight: 350,        // Más alto para móviles
    width: '100%',  
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 16,
  },
  userEmail: {
    color: colors.textLight,
    fontSize: 14,
    marginTop: 2,
  },
  userRole: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  userRoleAdmin: {
    backgroundColor: '#d1e7dd',
  },
  userRoleText: {
    fontSize: 12,
    color: colors.text,
  },
  // ...existing code...
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
modalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
  maxHeight: '90%',
  width: '100%',         // Ocupa todo el ancho posible
  minWidth: 280,         // Un mínimo para móviles pequeños
  alignSelf: 'center',
},
// ...existing code...
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  userModalContainer: {
    padding: 15,
  },
  userModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '100%',
  },
  userModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  userModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userModalEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  userModalRole: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userModalRoleText: {
    fontSize: 14,
    color: colors.text,
  },
  userDetailsContainer: {
    marginBottom: 20,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userDetailLabel: {
    marginLeft: 8,
    color: colors.textLight,
    width: 100,
  },
  userDetailValue: {
    flex: 1,
    color: colors.text,
    marginLeft: 8,
  },
  activeUser: {
    color: colors.success,
    fontWeight: 'bold',
  },
  inactiveUser: {
    color: colors.error,
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: colors.primary,
    flex: 1,
    marginRight: 5,
  },
  disableButton: {
    backgroundColor: colors.error,
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: colors.textLight,
    flex: 1,
    marginRight: 5,
  },
  editScrollContainer: {
    paddingBottom: 20,
  },
  // Contenedor de botones de edición (mitad y mitad)
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },

  // Estilo para botones mitad y mitad
  halfWidthButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },

  halfWidthButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  cancelEditButton: {
    backgroundColor: colors.textLight,
  },

  saveEditButton: {
    backgroundColor: colors.primary,
  },

  // Contenedor de botones de acción (editar/deshabilitar)
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30, // Más espacio arriba
    marginBottom: 20, // Más espacio abajo
    paddingHorizontal: 10,
  },

  // Estilo para botones de acción
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },

  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editSuccessModal: {
  padding: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
editSuccessContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 25,
  width: '100%',
  alignItems: 'center',
},
editSuccessIcon: {
  marginBottom: 15,
},
editSuccessTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text,
  marginBottom: 10,
  textAlign: 'center',
},
editSuccessText: {
  fontSize: 16,
  color: colors.textLight,
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 22,
},
editSuccessButton: {
  backgroundColor: colors.primary,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 24,
  width: '100%',
  alignItems: 'center',
},
editSuccessButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
confirmModalContainer: {
  padding: 20,
},
confirmModalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
},
confirmModalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
},
confirmModalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.text,
  marginLeft: 10,
},

cancelButton: {
  backgroundColor: colors.textLight,
  marginRight: 5,
},
disableButton: {
  backgroundColor: colors.error,
  marginLeft: 5,
},
confirmModalButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

successModalContainer: {
  padding: 20,
},
successModalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 25,
  alignItems: 'center',
},
successModalIcon: {
  marginBottom: 15,
},
successModalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text,
  marginBottom: 10,
},
successModalText: {
  fontSize: 16,
  color: colors.textLight,
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 22,
},
successModalButton: {
  backgroundColor: colors.primary,
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 24,
  width: '100%',
  alignItems: 'center',
},
successModalButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},


// Botones base
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 25,
  },

  // Estilos específicos para cada tipo de botón
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonGeneral: {  // Renombrado para evitar conflicto
    backgroundColor: colors.textLight,
  },
  disableButtonGeneral: {  // Renombrado para evitar conflicto
    backgroundColor: colors.error,
  },

  // Botones de acción (editar/deshabilitar)
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },

  // Botones en modales específicos
  modalCancelButton: {
    backgroundColor: colors.textLight,
    marginRight: 5,
  },
  modalDisableButton: {
    backgroundColor: colors.error,
    marginLeft: 5,
  },
  // ...existing code...
cardPickerModalContent: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
  maxHeight: '80%',
  width: '90%',
  minWidth: 280,
  alignSelf: 'center',
  justifyContent: 'flex-start',
  maxHeight: '80%',  
},
// ...existing code...
cardSelector: {
  justifyContent: 'center',
  alignItems: 'flex-start', // Para que el texto quede alineado a la izquierda
  paddingVertical: 15,      // Más alto para el dedo
  paddingHorizontal: 12,    // Más espacio a los lados
  minHeight: 48,            // Altura mínima tipo botón
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  backgroundColor: '#fff',
  width: '100%',            // Ocupa todo el ancho del contenedor
  marginTop: 4,
},
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  padding: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
},
listContainer: {
  maxHeight: 350, // Altura máxima para la lista
  width: '100%',   // Ocupa todo el ancho del contenedor
},
cardItem: {
  padding: 18,           // Más espacio para el dedo
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  width: '100%',
},
cardText: {
  fontSize: 16,
},
cardDate: {
  fontSize: 12,
  color: colors.textLight,
  marginTop: 5,
},
emptyText: {
  textAlign: 'center',
  padding: 20,
  color: colors.textLight,
},
closeButton: {
  marginTop: 15,
  padding: 10,
  backgroundColor: colors.danger,
  borderRadius: 5,
  alignItems: 'center',
},
closeButtonText: {
  color: 'white',
  fontWeight: 'bold',
},
 
  
});

export default ManageUsersScreen;