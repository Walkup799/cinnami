import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../utils/customAlert';
import { globalStyles, colors } from '../styles/globalStyles';
import { API_BASE_URL } from '../utils/constants';

const LoginScreen = ({ navigation, setUserRole }) => {
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      console.log('Respuesta del login:', data);

      setIsLoading(false);

      if (response.ok) {
        // Verificar si el usuario está habilitado
        if (data.user?.status === false) {
          // Limpiar formulario antes de mostrar alerta
        setIdentifier('');
        setPassword('');
        setShowPassword(false);
          setAlertData({
            title: 'Cuenta Deshabilitada',
            message: data.message || 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
          });
          setAlertVisible(true);
          return;
        }

        // Guardar tokens y datos
        await AsyncStorage.multiSet([
          ['userToken', data.accessToken],
          ['refreshToken', data.refreshToken],
          ['userRole', data.user.role],
          ['username', data.user.username],
          ['userData', JSON.stringify({
            _id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            firstName: data.user.firstName,   
            lastName: data.user.lastName,     
            cardId: data.user.cardId,         
            lastAccess: data.user.lastAccess 
          })]
        ]);

        setUserRole(data.user.role);
         await AsyncStorage.setItem('cardId', data.user.cardId); 
         console.log('Datos que se están guardando:', {
  cardId: data.user.cardId,
  userData: data.user
});
      } else {
        // Manejo de errores
        if (response.status === 403 && data.code === 'ACCOUNT_DISABLED') {
          setIdentifier('');
        setPassword('');
        setShowPassword(false);

          setAlertData({
            title: 'Cuenta Deshabilitada',
            message: data.message || 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
          });
          setAlertVisible(true);
        } else if (data.message?.toLowerCase().includes('contraseña')) {
          setPasswordError('Contraseña incorrecta');
        } else if (data.message?.toLowerCase().includes('usuario')) {
          setIdentifierError('Correo electrónico o usuario no registrado');
        } else {
          setAlertData({
            title: 'Error de autenticación',
            message: data.message || 'Ocurrió un error al iniciar sesión'
          });
          setAlertVisible(true);
        }
      }
    } catch (error) {
      setIdentifier('');
        setPassword('');
        setShowPassword(false);
      setIsLoading(false);
      setAlertData({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor'
      });
      setAlertVisible(true);
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

        <CustomAlert
          visible={alertVisible}
          title={alertData.title}
          message={alertData.message}
          onClose={() => setAlertVisible(false)}
        />
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