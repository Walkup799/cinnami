import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../utils/constants';

export default function ResetPasswordScreen() {
  const [token, setToken] = useState(''); // ← si usas deep linking, esto lo llenas automáticamente
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleReset = async () => {
    setMsg('');
    setErr('');
    if (password.length < 6) return setErr('Debe tener al menos 6 caracteres');
    if (password !== confirm) return setErr('Las contraseñas no coinciden');
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('¡Contraseña cambiada exitosamente!');
      } else {
        setErr(data.message || 'Token inválido o expirado');
      }
    } catch (e) {
      setErr('Error de conexión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer contraseña</Text>
      <TextInput placeholder="Token" value={token} onChangeText={setToken} style={styles.input} />
      <TextInput placeholder="Nueva contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirmar contraseña" secureTextEntry value={confirm} onChangeText={setConfirm} style={styles.input} />
      <Button title="Cambiar contraseña" onPress={handleReset} />
      {msg && <Text style={styles.success}>{msg}</Text>}
      {err && <Text style={styles.error}>{err}</Text>}
    </View>
  );
}
