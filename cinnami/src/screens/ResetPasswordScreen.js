import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../utils/constants';
import { useRoute } from '@react-navigation/native';
import SuccessAlert from '../utils/SuccessAlert';

export default function ResetPasswordScreen() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const route = useRoute();


  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // success, error, warning, info, confirm

    
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
    }
  }, [route.params]);

  const handleReset = async () => {
    setAlertVisible(false);

    if (password.length < 6) {
    setAlertTitle('Error');
    setAlertMessage('Debe tener al menos 6 caracteres');
    setAlertType('error');
    setAlertVisible(true);
    return;
  }
  if (password !== confirm) {
    setAlertTitle('Error');
    setAlertMessage('Las contraseñas no coinciden');
    setAlertType('error');
    setAlertVisible(true);
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
        setAlertMessage('Contraseña cambiada exitosamente');
        setAlertType('success');
        setAlertVisible(true);
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer contraseña</Text>

      {/* Opcional: oculta el token si viene del link */}
      { !token && (
        <TextInput
          placeholder="Token"
          value={token}
          onChangeText={setToken}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
      />

      <Button title="Cambiar contraseña" onPress={handleReset} />

      <SuccessAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  success: { color: 'green', marginTop: 15, textAlign: 'center' },
  error: { color: 'red', marginTop: 15, textAlign: 'center' },
});