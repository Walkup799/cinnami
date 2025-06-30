// src/screens/admin/ManageUsersScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function ManageUsersScreen() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    date: new Date(),
    materia: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Docente',
    names: '',
    surnames: '',
    uid: ''
  });

  const loadUsers = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('@users');
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    }
  };

  const saveUsers = async (usersToSave) => {
    try {
      await AsyncStorage.setItem('@users', JSON.stringify(usersToSave));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los usuarios');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.date.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleSaveUser = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre válido');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const userData = {
      fullName: formData.fullName.trim(),
      date: formData.date.toLocaleDateString(),
      materia: formData.materia.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      names: formData.names.trim(),
      surnames: formData.surnames.trim(),
      uid: formData.uid.trim(),
      id: editingUserId || Date.now().toString()
    };

    let updatedUsers;
    if (editingUserId) {
      updatedUsers = users.map(user => user.id === editingUserId ? userData : user);
    } else {
      updatedUsers = [...users, userData];
    }

    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    Alert.alert('Éxito', editingUserId ? 'Usuario actualizado' : 'Usuario agregado');
    setFormData({
      fullName: '',
      date: new Date(),
      materia: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Docente',
      names: '',
      surnames: '',
      uid: ''
    });
    setEditingUserId(null);
    setShowForm(false);
  };

  const handleDeleteUser = (userId) => {
    Alert.alert(
      '¿Eliminar usuario?',
      '¿Estás seguro que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            await saveUsers(updatedUsers);
            Alert.alert('Éxito', 'Usuario eliminado');
          }
        }
      ]
    );
  };

  const handleEditUser = (user) => {
    setFormData({
      fullName: user.fullName,
      date: new Date(user.date),
      materia: user.materia,
      username: user.username,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
      role: user.role,
      names: user.names,
      surnames: user.surnames,
      uid: user.uid
    });
    setEditingUserId(user.id);
    setShowForm(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración de Usuarios</Text>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#7A6E5F" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o fecha..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {!showForm && (
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => setShowForm(true)}>
          <Text style={styles.buttonText}>Agregar nuevo usuario</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <ScrollView style={{ maxHeight: 400, marginBottom: 20 }}>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Materia"
              value={formData.materia}
              onChangeText={(value) => handleInputChange('materia', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre(s)"
              value={formData.names}
              onChangeText={(value) => handleInputChange('names', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido(s)"
              value={formData.surnames}
              onChangeText={(value) => handleInputChange('surnames', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="UID de Tarjeta"
              value={formData.uid}
              onChangeText={(value) => handleInputChange('uid', value)}
            />

            {/* Rol */}
            <View style={styles.edificioContainer}>
              <Text style={styles.edificioLabel}>Rol:</Text>
              {['Docente', 'Admin'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.edificioButton, formData.role === role && styles.selectedEdificio]}
                  onPress={() => handleInputChange('role', role)}
                >
                  <Text style={styles.edificioText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text>{formData.date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={formData.date} mode="date" display="default" onChange={handleDateChange} />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveUser}>
                <Text style={styles.buttonText}>{editingUserId ? 'Actualizar' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.userDate}>Fecha: {item.date}</Text>
                <Text style={styles.userDate}>Materia: {item.materia}</Text>
                <Text style={styles.userDate}>Usuario: {item.username}</Text>
                <Text style={styles.userDate}>Email: {item.email}</Text>
                <Text style={styles.userDate}>Rol: {item.role}</Text>
                <Text style={styles.userDate}>Nombre(s): {item.names}</Text>
                <Text style={styles.userDate}>Apellido(s): {item.surnames}</Text>
                <Text style={styles.userDate}>UID: {item.uid}</Text>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditUser(item)}>
                  <Icon name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteUser(item.id)}>
                  <Icon name="trash-can" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const colors = {
  canela: '#D2A679',
  beige: '#F5E6D3',
  white: '#FFFFFF',
  darkBeige: '#E8D5B5',
  textDark: '#4A3F35',
  textLight: '#7A6E5F',
  danger: '#E57373',
  success: '#81C784',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.beige,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    borderColor: colors.darkBeige,
    borderWidth: 1,
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  dateInput: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  edificioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  edificioLabel: {
    marginRight: 10,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  edificioButton: {
    padding: 10,
    backgroundColor: colors.darkBeige,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 5,
  },
  selectedEdificio: {
    backgroundColor: colors.canela,
  },
  edificioText: {
    color: colors.textDark,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: colors.canela,
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  userDate: {
    color: colors.textLight,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
});

export default ManageUsersScreen;