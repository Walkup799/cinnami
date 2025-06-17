import AsyncStorage from '@react-native-async-storage/async-storage';

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
      return null;
    }
  } catch (error) {
    console.error('Error en handleTokenRefresh:', error);
    return null;
  }
};


//CERRAR SESION
export const logoutUser = async (setUserRole) => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('userRole');
  setUserRole(null); // Esto activa el redireccionamiento en App.js
};
