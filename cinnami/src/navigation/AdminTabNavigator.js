import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Portal, Dialog, Paragraph, Button, Provider as PaperProvider } from 'react-native-paper';

import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ManageCardsScreen from '../screens/admin/ManageCardsScreen';
import DoorStatusScreen from '../screens/admin/DoorStatusScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import { colors, globalStyles } from '../styles/globalStyles';

import { logoutUser } from '../utils/authHelpers'; // importa el helper logoutUser

const Tab = createBottomTabNavigator();

const AdminTabNavigator = ({ setUserRole }) => {
  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleLogout = async () => {
    try {
      await logoutUser(setUserRole); // ahora llama al backend y limpia localmente
      hideDialog();
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
    }
  };

  return (
    <PaperProvider
      settings={{
        icon: props => <Ionicons {...props} color={colors.canela} />,
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Tarjetas') iconName = focused ? 'card' : 'card-outline';
            else if (route.name === 'Puerta') iconName = focused ? 'exit' : 'exit-outline';
            else if (route.name === 'Usuarios') iconName = focused ? 'people' : 'people-outline';

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
        <Tab.Screen name="Inicio" component={AdminHomeScreen} />
        <Tab.Screen name="Tarjetas" component={ManageCardsScreen} />
        <Tab.Screen name="Usuarios" component={ManageUsersScreen} />
        <Tab.Screen name="Puerta" component={DoorStatusScreen} />
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
            <Button onPress={handleLogout} textColor="#a0522d" >
              Cerrar sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
};

export default AdminTabNavigator;
