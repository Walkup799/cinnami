import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/constants'; 

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
  try {
    setIsLoading(true);

    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Manejo de error
      console.error('Error en forgot-password:', data);
      alert(data.message || 'No se pudo enviar el correo. Verifica tu correo electrónico.');
      return;
    }

    // Éxito
    console.log('Correo enviado:', data);
    navigation.navigate('PasswordResetSuccess');
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    alert('Ocurrió un error. Intenta de nuevo más tarde.');
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
        {/* Logo compacto */}
        <Image 
          source={require('../../assets/images/cinnami_logo.jpeg')} 
          style={styles.logo}
        />

        {/* Formulario compacto */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>Ingresa tu correo electrónico para recibir instrucciones</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#D2A679" />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@cinnami.com"
              placeholderTextColor="#B8B8B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, email === '' && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || email === ''}
          >
            <Text style={styles.buttonText}>Enviar instrucciones</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer minimalista */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CINNAMI — Smart solutions for a connected world</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D5B5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#D2A679',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;