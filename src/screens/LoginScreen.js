import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validCredentials = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    user: { email: 'user@example.com', password: 'user123' }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = () => {
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Por favor ingrese su correo electrónico');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Ingrese un correo electrónico válido');
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

    setTimeout(() => {
      setIsLoading(false);
      
      if (email === validCredentials.admin.email && password === validCredentials.admin.password) {
        console.log('DEBUG - Rol asignado: admin');
        setUserRole('admin');
      } else if (email === validCredentials.user.email && password === validCredentials.user.password) {
        console.log('DEBUG - Rol asignado: user');
        setUserRole('user');
      } else {
        const emailExists = Object.values(validCredentials).some(cred => cred.email === email);
        
        if (!emailExists) {
          setEmailError('Correo electrónico no registrado');
        } else {
          setPasswordError('Contraseña incorrecta');
        }
        
        Alert.alert(
          'Error de autenticación',
          emailExists ? 'Contraseña incorrecta' : 'Correo electrónico no registrado',
          [{ text: 'OK' }]
        );
      }
    }, 1500);
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
              style={[globalStyles.input, styles.input, emailError ? styles.inputError : null]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
          style={[globalStyles.button, styles.button, (isLoading || !email || !password) ? styles.buttonDisabled : null]}
          onPress={handleLogin}
          disabled={isLoading || !email || !password}
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.footerText, styles.footerLink]}> Regístrate</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: colors.textLight,
  },
  footerLink: {
    color: colors.canela,
    fontWeight: 'bold',
  },
});

export default LoginScreen;