import AsyncStorage from '@react-native-async-storage/async-storage';

export const logout = async (setUserRole) => {
  try {
    console.log("Cerrando sesión...");
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userRole');
    setUserRole(null); // Redirige a login
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

