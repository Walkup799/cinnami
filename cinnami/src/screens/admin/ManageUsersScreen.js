import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal, Portal, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';




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



   // Función para guardar cambios al editar
  const handleSaveChanges = async () => {
  // Validar el formulario primero (sin validar contraseña ya que admin no la cambia)
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
        cardId: formData.cardId,
        role: formData.role
        // No incluimos password ni confirmPassword
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar el estado local con los cambios
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id ? { 
          ...user, 
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          cardId: formData.cardId,
          role: formData.role
        } : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSelectedUser(prev => ({
        ...prev,
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        cardId: formData.cardId,
        role: formData.role
      }));
      
      setEditMode(false);
      setEditSuccessModal(true);
      Alert.alert('Éxito', 'Cambios guardados correctamente');
      console.log('Usuario actualizado:');
    } else {
      showError(data.message || 'Error al actualizar usuario');
      console.error('Error del backend:', data);
    }
  } catch (error) {
    console.error('Error de conexión:', error);
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
    showError(error.message || 'Error al cargar usuarios');
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
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setModalVisible(true);
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
        loadUsers();
      } else {
        showError(data.message || 'Error al guardar usuario');
        console.log('Error del backend:', data);
      }
    } catch (error) {
      showError('Error de conexión');
      console.log('Error de conexión:', error); 
    } finally {
      setIsLoading(false);
    }
  };

  const showError = (message) => {
    // Aquí podrías usar un toast o snackbar en lugar de alerta
    Alert.alert('Error', message);
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
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
              { name: 'cardId', label: 'ID de Tarjeta', icon: 'card-bulleted' },
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
                <ScrollView contentContainerStyle={styles.editScrollContainer} >
                  <Text style={styles.userModalTitle}>Editar Usuario</Text>
                  
                  {/* Formulario de edición similar al de creación */}
                  {[
                    { name: 'username', label: 'Nombre de usuario', icon: 'account' },
                    { name: 'email', label: 'Correo electrónico', icon: 'email', keyboardType: 'email-address' },
                    { name: 'firstName', label: 'Nombres', icon: 'card-account-details' },
                    { name: 'lastName', label: 'Apellidos', icon: 'card-account-details' },
                    { name: 'cardId', label: 'ID de Tarjeta', icon: 'card-bulleted' },
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
                        {selectedUser?.active  !== false ? 'Activo' : 'Inactivo'}
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
                onPress={() => setEditSuccessModal(false)}
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
            
            <View style={styles.confirmModalButtonText}>
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

      </View>
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
    flex: 1,
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
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
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
    padding: 20,
  },
  userModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
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

 
  
});

export default ManageUsersScreen;