import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import UserStackNavigator from './src/navigation/UserStackNavigator'; // nuevo import
import { colors } from './src/styles/globalStyles';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
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
        <AdminTabNavigator />
      ) : userRole === 'docente' ? (
        <UserStackNavigator />
      ) : (
        <AuthNavigator setUserRole={setUserRole} />
      )}
    </NavigationContainer>
  );
};

export default App;
