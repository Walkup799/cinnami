// src/screens/admin/DoorStatusScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import NotificationBanner from '../../components/NotificationBanner';

const DoorStatusScreen = () => {
  const [doorOpen, setDoorOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    if (doorOpen && notificationEnabled) {
      const interval = setInterval(() => {
        setNotificationVisible(true);
        setTimeout(() => setNotificationVisible(false), 5000);
      }, 15 * 60 * 1000); // Cada 15 minutos

      return () => clearInterval(interval);
    }
  }, [doorOpen, notificationEnabled]);

  return (
    <View style={globalStyles.container}>
      <NotificationBanner 
        message="¡Alerta! La puerta ha estado abierta por más de 15 minutos" 
        visible={notificationVisible} 
        onClose={() => setNotificationVisible(false)}
      />
      
      <View style={[globalStyles.card, { alignItems: 'center' }]}>
        <Text style={globalStyles.subtitle}>Estado actual de la puerta</Text>
        <Text style={[globalStyles.title, { 
          fontSize: 32, 
          color: doorOpen ? colors.success : colors.danger // Verde si abierta, rojo si cerrada
        }]}>
          {doorOpen ? 'ABIERTA' : 'CERRADA'}
        </Text>
        
        <TouchableOpacity 
          style={[globalStyles.button, { 
            backgroundColor: doorOpen ? colors.danger : colors.success, // Rojo si abierta, verde si cerrada
            width: '80%'
          }]}
          onPress={() => setDoorOpen(!doorOpen)}
        >
          <Text style={globalStyles.buttonText}>
            {doorOpen ? 'Cerrar Puerta' : 'Abrir Puerta'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[globalStyles.card, { marginTop: 20 }]}>
        <View style={styles.settingRow}>
          <Text style={[globalStyles.subtitle, { flex: 1 }]}>Notificaciones cada 15 min</Text>
          <Switch
            value={notificationEnabled}
            onValueChange={setNotificationEnabled}
            thumbColor={colors.white}
            trackColor={{ false: colors.textLight, true: colors.canela }}
          />
        </View>
        
        <Text style={{ color: colors.textLight, marginTop: 10 }}>
          {notificationEnabled 
            ? 'Recibirás alertas cuando la puerta esté abierta por más de 15 minutos'
            : 'Las notificaciones están desactivadas'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default DoorStatusScreen;
