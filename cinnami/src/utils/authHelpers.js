// utils/authHelpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './constants';

export const handleTokenRefresh = async (showError) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      showError?.('La sesión ha expirado. Por favor ingresa nuevamente');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem('userToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } else {
      showError?.(data.message || 'Error al renovar la sesión');
      await logoutUser(); 
      return null;
    }
  } catch (error) {
    showError?.('Error de conexión al renovar sesión');
    await logoutUser();
    return null;
  }
};

export const logoutUser = async (setUserRole, showError) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await AsyncStorage.getItem('userToken');

    if (refreshToken && accessToken) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    showError?.('Error al cerrar sesión en el servidor');
    console.error('Error al cerrar sesión en el backend:', error);
  }

  // Eliminar localmente
  await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userRole', 'username']);

  if (setUserRole) {
    setUserRole(null);
  }
};