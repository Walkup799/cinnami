import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ManageCardsScreen from '../screens/admin/ManageCardsScreen';
import DoorStatusScreen from '../screens/admin/DoorStatusScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import { colors, globalStyles } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const handleLogout = () => {
  Alert.alert(
    'Cerrar sesión',
    '¿Estás seguro de que quieres cerrar sesión?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('userRole');
          setUserRole(null); // Esto redirige a Login porque lo controla App.js
        },
        style: 'destructive'
      }
    ]
  );
};


const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: { logout: true }
    });
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tarjetas') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Puerta') {
            iconName = focused ? 'exit' : 'exit-outline';
          } else if (route.name === 'Usuarios') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.canela,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: globalStyles.tabBar,
        tabBarLabelStyle: globalStyles.tabLabel,
        headerStyle: {
          backgroundColor: colors.beige,
        },
        headerTitleStyle: {
          color: colors.textDark,
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.canela}
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={AdminHomeScreen} />
      <Tab.Screen name="Tarjetas" component={ManageCardsScreen} />
      <Tab.Screen name="Usuarios" component={ManageUsersScreen} />
      <Tab.Screen name="Puerta" component={DoorStatusScreen} />

    </Tab.Navigator>
  );
};

export default AdminTabNavigator;