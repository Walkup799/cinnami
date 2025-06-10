import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import CardStatusScreen from '../screens/user/CardStatusScreen';
import AccessHistoryScreen from '../screens/user/AccessHistoryScreen';
import { colors, globalStyles } from '../styles/globalStyles';

const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: { logout: true },
    });
  };

  const screenOptions = {
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
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Mi Tarjeta') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'time' : 'time-outline';
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
        ...screenOptions,
      })}
    >
      <Tab.Screen name="Inicio" component={UserHomeScreen} options={screenOptions} />
      <Tab.Screen name="Mi Tarjeta" component={CardStatusScreen} options={screenOptions} />
      <Tab.Screen name="Historial" component={AccessHistoryScreen} options={screenOptions} />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;
