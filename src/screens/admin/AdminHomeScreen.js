import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import NotificationBanner from '../../components/NotificationBanner';

const AdminHomeScreen = () => {
  const peopleCount = 1245;
  const doorStatus = 'Abierta';

  return (
    <ScrollView style={globalStyles.container}>
      <NotificationBanner 
        message="La puerta ha estado abierta por más de 15 minutos" 
        visible={doorStatus === 'Abierta'} 
        onClose={() => console.log('Banner cerrado')}
      />
      
      <View style={[globalStyles.card, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View>
          <Text style={globalStyles.subtitle}>Personas ingresadas</Text>
          <Text style={[globalStyles.title, { color: colors.canela }]}>{peopleCount}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={globalStyles.subtitle}>Estado de puerta</Text>
          <Text style={[
            globalStyles.title,
            { color: doorStatus === 'Abierta' ? colors.danger : colors.success }
          ]}>
            {doorStatus}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={[globalStyles.button, { marginTop: 30 }]}>
        <Text style={globalStyles.buttonText}>Ver historial de accesos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AdminHomeScreen;
