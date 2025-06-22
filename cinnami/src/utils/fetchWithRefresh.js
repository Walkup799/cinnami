import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleTokenRefresh, logoutUser } from './authHelpers';

export const fetchWithRefresh = async (url, options = {}, setUserRole) => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Token expirado, intento refrescar
      const newToken = await handleTokenRefresh();

      if (newToken) {
        // Reintento la llamada con el nuevo token
        const newHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        };
        return await fetch(url, { ...options, headers: newHeaders });
      } else {
        // No pudo refrescar, hacer logout
        if (setUserRole) await logoutUser(setUserRole);
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('Error en fetchWithRefresh:', error);
    if (setUserRole) await logoutUser(setUserRole);
    return null;
  }
};
