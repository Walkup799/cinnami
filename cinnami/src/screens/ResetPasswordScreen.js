import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/constants';
import { useRoute } from '@react-navigation/native';
import SuccessAlert from '../utils/SuccessAlert';

export default function ResetPasswordScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const route = useRoute();

  useEffect(() => {
    if (route.params?.token) setToken(route.params.token);
  }, [route.params]);

  const handleReset = async () => {
    setIsLoading(true);
    setAlertVisible(false);

    if (password.length < 6) {
      setAlertTitle('Error');
      setAlertMessage('La contraseña debe tener al menos 6 caracteres');
      setAlertType('error');
      setAlertVisible(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setAlertTitle('Error');
      setAlertMessage('Las contraseñas no coinciden');
      setAlertType('error');
      setAlertVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlertTitle('¡Éxito!');
        setAlertMessage('Contraseña actualizada correctamente');
        setAlertType('success');
        setAlertVisible(true);
        setTimeout(() => navigation.navigate('Login'), 2000); // Redirigir después de 2 segundos
      } else {
        setAlertTitle('Error');
        setAlertMessage(data.message || 'Token inválido o expirado');
        setAlertType('error');
        setAlertVisible(true);
      }
    } catch (e) {
      setAlertTitle('Error');
      setAlertMessage('Error de conexión');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../../assets/images/cinnami_logo.jpeg')}
          style={styles.logo}
        />

        {/* Formulario con el nuevo diseño */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Restablecer contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu nueva contraseña y confírmala</Text>

          {/* Input: Nueva contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#D2A679" />
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Input: Confirmar contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#D2A679" />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          {/* Botón con estados de carga */}
          <TouchableOpacity 
            style={[styles.button, (isLoading || !password || !confirm) && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isLoading || !password || !confirm}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Actualizar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer minimalista */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CINNAMI — Smart solutions for a connected world</Text>
      </View>

      {/* Alerta (personalizable) */}
      <SuccessAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

// Estilos actualizados para coincidir con el diseño de Snack
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0', // Fondo cálido
    paddingHorizontal: 25,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 140,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16, // Bordes más redondeados
    padding: 25,
    shadowColor: '#E8D5B5', // Sombra más suave
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22, // Tamaño ligeramente mayor
    fontWeight: '600',
    color: '#3A3A3A', // Texto más oscuro
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold', // Usa tu fuente personalizada si la tienes
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8D5B5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    backgroundColor: '#FFFDFA', // Fondo ligeramente cálido
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 12,
    fontFamily: 'Inter-Medium',
  },
  button: {
    backgroundColor: '#D2A679',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#D2A679',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#E8D5B5',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#B8B8B8',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});