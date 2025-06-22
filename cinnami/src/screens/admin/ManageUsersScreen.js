import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal, Portal, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';



const ManageUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
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

  const loadUsers = async () => {
  setIsLoading(true);
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token cargado:', token);

    if (!token) {
      showError('No se encontró el token. Por favor, inicia sesión nuevamente.');
      setIsLoading(false);
      return;
    }

    const response = await fetch('http://192.168.1.7:3000/api/auth/all-users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      setUsers(data.users);
      setFilteredUsers(data.users);
    } else {
      showError(data.message || 'Error al cargar usuarios');
      console.log('Error al cargar usuarios:', data);
    }
  } catch (error) {
    console.error('Error de conexión al cargar usuarios:', error);
    showError('Error de conexión');
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
      const response = await fetch('http://192.168.1.7:3000/api/auth/users', {
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
      }
    } catch (error) {
      showError('Error de conexión');
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
                onPress={() => navigation.navigate('UserDetail', { userId: user._id })}
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
});

export default ManageUsersScreen;