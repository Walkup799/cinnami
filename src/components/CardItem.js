// src/components/CardItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../styles/globalStyles';


const CardItem = ({ cardNumber, ownerName, status, onBlock, onDelete, isAdmin = false }) => {
  return (
    <View style={[globalStyles.card, { marginBottom: 10 }]}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textDark }}>
        Tarjeta: {cardNumber}
      </Text>
      <Text style={{ color: colors.textLight, marginVertical: 5 }}>Usuario: {ownerName}</Text>
      <Text style={{ color: status === 'active' ? colors.success : colors.danger }}>
        Estado: {status === 'active' ? 'Activa' : 'Bloqueada'}
      </Text>
      
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: status === 'active' ? colors.danger : colors.success 
          }]}
          onPress={onBlock}
        >
          <Text style={styles.buttonText}>
            {status === 'active' ? 'Bloquear' : 'Desbloquear'}
          </Text>
        </TouchableOpacity>
        
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.danger, 
              marginLeft: 10 
            }]}
            onPress={onDelete}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
  },
});

export default CardItem;