import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import UserStackNavigator from './src/navigation/UserStackNavigator';
import { colors } from './src/styles/globalStyles';
import { handleTokenRefresh } from './src/utils/authHelpers'; 

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
  const initializeApp = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedRole = await AsyncStorage.getItem('userRole');

      if (storedToken && storedRole) {
        // opcional: validar el token con una petición protegida o simplemente confiar
        setUserRole(storedRole);
      } else {
        // intentar refrescar el token
        const newAccessToken = await handleTokenRefresh();
        const newRole = await AsyncStorage.getItem('userRole');

        if (newAccessToken && newRole) {
          setUserRole(newRole);
        }
      }
    } catch (error) {
      console.log('Error al inicializar la app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  initializeApp();
}, []);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.beige }}>
        <ActivityIndicator size="large" color={colors.canela} />
      </View>
    );
  }

  return (
    <NavigationContainer>
    {userRole === 'admin' ? (
      <AdminTabNavigator setUserRole={setUserRole} />
    ) : userRole === 'docente' ? (
      <UserStackNavigator setUserRole={setUserRole} />
    ) : (
      <AuthNavigator setUserRole={setUserRole} />
    )}
  </NavigationContainer>
  );
};

export default App;
