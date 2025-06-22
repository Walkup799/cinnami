import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation, setUserRole }) => {
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIdentifierError('');
    setPasswordError('');

    let isValid = true;

    if (!identifier.trim()) {
      setIdentifierError('Por favor ingrese su correo electrónico o nombre de usuario');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Por favor ingrese su contraseña');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.1.7:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      console.log('Respuesta del login:', data);

      setIsLoading(false);

      if (response.ok) {
        // Guardar tokens y datos
        await AsyncStorage.setItem('userToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        await AsyncStorage.setItem('userRole', data.user.role);
        await AsyncStorage.setItem('username', data.user.username);

        setUserRole(data.user.role);
      } else {
         if (data.message?.toLowerCase().includes('contraseña')) {
            setPasswordError('Contraseña incorrecta');
          } else if (data.message?.toLowerCase().includes('usuario')) {
            setIdentifierError('Correo electrónico o usuario no registrado');
          } else {
            setIdentifierError(data.message || 'Error en autenticación');
            setPasswordError(data.message || 'Error en autenticación');
          }
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor', [{ text: 'OK' }]);
      console.error('ERROR LOGIN:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[globalStyles.container, styles.container]}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Control de Acceso</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.icon} />
            <TextInput
              placeholder="Correo electrónico o nombre de usuario"
              placeholderTextColor={colors.textLight}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setIdentifierError('');
              }}
              style={[globalStyles.input, styles.input, identifierError ? styles.inputError : null]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {identifierError ? <Text style={styles.errorText}>{identifierError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.icon} />
            <TextInput
              style={[globalStyles.input, styles.input, passwordError ? styles.inputError : null]}
              placeholder="Contraseña"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={20} 
                color={colors.textLight} 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, styles.button, (isLoading || !identifier || !password) ? styles.buttonDisabled : null]}
          onPress={handleLogin}
          disabled={isLoading || !identifier || !password}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...globalStyles.title,
    textAlign: 'center',
    color: colors.canela,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    paddingLeft: 45,
    width: '100%',
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: colors.canela,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
