// src/screens/user/CardStatusScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';

const CardStatusScreen = () => {
  const [cardBlocked, setCardBlocked] = useState(false);
  const [temporaryBlock, setTemporaryBlock] = useState(false);
  const [blockDuration, setBlockDuration] = useState('1');

  const handleBlockCard = () => {
    if (temporaryBlock) {
      alert(`Tarjeta bloqueada temporalmente por ${blockDuration} hora(s)`);
    } else {
      alert(cardBlocked ? 'Tarjeta desbloqueada' : 'Tarjeta bloqueada permanentemente');
    }
    setCardBlocked(!cardBlocked);
  };

  return (
    <View style={globalStyles.container}>
      <View style={[globalStyles.card, { alignItems: 'center' }]}>
        <Text style={globalStyles.subtitle}>Estado de tu tarjeta</Text>
        <Text style={[globalStyles.title, { 
          fontSize: 32, 
          color: cardBlocked ? colors.danger : colors.success 
        }]}>
          {cardBlocked ? 'BLOQUEADA' : 'ACTIVA'}
        </Text>
        <Text style={{ color: colors.textLight }}>
          Número: A1B2C3
        </Text>
      </View>
      
      <View style={[globalStyles.card, { marginTop: 20 }]}>
        <Text style={globalStyles.subtitle}>Opciones de bloqueo</Text>
        
        <View style={styles.optionRow}>
          <Text style={{ flex: 1, color: colors.textDark }}>Bloqueo temporal</Text>
          <Switch
            value={temporaryBlock}
            onValueChange={setTemporaryBlock}
            thumbColor={colors.white}
            trackColor={{ false: colors.textLight, true: colors.canela }}
          />
        </View>
        
        {temporaryBlock && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: colors.textLight, marginBottom: 5 }}>Duración del bloqueo:</Text>
            <View style={styles.durationOptions}>
              {['1', '3', '6', '12'].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.durationButton,
                    blockDuration === hours && { backgroundColor: colors.canela }
                  ]}
                  onPress={() => setBlockDuration(hours)}
                >
                  <Text style={[
                    styles.durationText,
                    blockDuration === hours && { color: colors.white }
                  ]}>
                    {hours} h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            globalStyles.button, 
            { 
              marginTop: 20,
              backgroundColor: cardBlocked ? colors.success : colors.danger 
            }
          ]}
          onPress={handleBlockCard}
        >
          <Text style={globalStyles.buttonText}>
            {cardBlocked ? 'Desbloquear Tarjeta' : 
             temporaryBlock ? 'Bloquear Temporalmente' : 'Bloquear Permanentemente'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.canela,
    width: '23%',
    alignItems: 'center',
  },
  durationText: {
    color: colors.canela,
  },
});

export default CardStatusScreen;