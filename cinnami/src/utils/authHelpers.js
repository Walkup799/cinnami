// utils/authHelpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// REFRESCAR TOKEN
export const handleTokenRefresh = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('No hay refresh token disponible');
      return null;
    }

    const response = await fetch('http://192.168.1.7:3000/api/auth/refresh-token', {
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
      console.log('Error al refrescar token:', data.message);

      // Si falló el refresh, se cierra sesión
      await logoutUser(); 
      return null;
    }
  } catch (error) {
    console.error('Error en handleTokenRefresh:', error);
    await logoutUser(); // por si hubo un fallo total
    return null;
  }
};


// CERRAR SESIÓN (con backend)
export const logoutUser = async (setUserRole) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await AsyncStorage.getItem('userToken');

    if (refreshToken && accessToken) {
      await fetch('192.168.1.197:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error('Error al cerrar sesión en el backend:', error);
  }

  // Eliminar localmente
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('userRole');
  await AsyncStorage.removeItem('username');

  if (setUserRole) {
    setUserRole(null); // Esto activa el redireccionamiento en App.js
  }
};
