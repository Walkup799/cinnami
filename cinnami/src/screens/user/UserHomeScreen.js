import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const UserHomeScreen = ({ navigation }) => {
  const lastAccess = {
    door: 'Puerta Principal',
    time: '10:30 AM',
    date: '15 Jun 2023',
    status: 'Acceso permitido'
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Ionicons name="person-circle-outline" size={100} color={colors.canela} />
        <Text style={globalStyles.title}>Bienvenido, Usuario</Text>
      </View>
      
      <View style={globalStyles.card}>
        <Text style={globalStyles.subtitle}>Último acceso</Text>
        <Text style={{ fontSize: 16, marginVertical: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>Lugar:</Text> {lastAccess.door}
        </Text>
        <Text style={{ fontSize: 16, marginVertical: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>Fecha:</Text> {lastAccess.date} a las {lastAccess.time}
        </Text>
        <Text style={{ 
          fontSize: 16, 
          marginVertical: 5,
          color: lastAccess.status === 'Acceso permitido' ? colors.success : colors.danger
        }}>
          <Text style={{ fontWeight: 'bold', color: colors.textDark }}>Estado:</Text> {lastAccess.status}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={globalStyles.button}
        onPress={() => navigation.navigate('Mi Tarjeta')}
      >
        <Text style={globalStyles.buttonText}>Gestionar mi tarjeta</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[globalStyles.button, { backgroundColor: colors.darkBeige }]}
        onPress={() => navigation.navigate('Historial')}
      >
        <Text style={[globalStyles.buttonText, { color: colors.textDark }]}>Ver mi historial</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserHomeScreen;