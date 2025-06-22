import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Portal,
  Dialog,
  Paragraph,
  Button,
  Provider as PaperProvider
} from 'react-native-paper';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import CardStatusScreen from '../screens/user/CardStatusScreen';
import AccessHistoryScreen from '../screens/user/AccessHistoryScreen';
import { colors, globalStyles } from '../styles/globalStyles';
import { logoutUser } from '../utils/authHelpers'; // 👈 Importa el helper

const Tab = createBottomTabNavigator();

const UserTabNavigator = ({ setUserRole }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleLogout = async () => {
    try {
      await logoutUser(setUserRole); // 👈 Llama al helper que hace logout completo
      hideDialog();
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
    }
  };

  return (
    <PaperProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Mi Tarjeta') iconName = focused ? 'card' : 'card-outline';
            else if (route.name === 'Historial') iconName = focused ? 'time' : 'time-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerRight: () => (
            <TouchableOpacity onPress={showDialog}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.canela}
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          ),
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
        })}
      >
        <Tab.Screen name="Inicio" component={UserHomeScreen} />
        <Tab.Screen name="Mi Tarjeta" component={CardStatusScreen} />
        <Tab.Screen name="Historial" component={AccessHistoryScreen} />
      </Tab.Navigator>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={{ backgroundColor: '#fff0e6', borderRadius: 10 }}
        >
          <Dialog.Title style={{ color: colors.canela, fontWeight: 'bold' }}>
            Cerrar sesión
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: colors.textDark, fontSize: 16 }}>
              ¿Estás seguro de que quieres cerrar sesión?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} textColor={colors.canela}>
              Cancelar
            </Button>
            <Button onPress={handleLogout} textColor="#a0522d">
              Cerrar sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
};

export default UserTabNavigator;
