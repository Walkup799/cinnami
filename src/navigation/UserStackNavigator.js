// src/navigation/UserStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserTabNavigator from './UserTabNavigator';

const Stack = createNativeStackNavigator();

const UserStackNavigator = ({ setUserRole }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs">
        {() => <UserTabNavigator setUserRole={setUserRole} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};


export default UserStackNavigator;
