import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomAlert = ({ visible, title, message, onClose, alertType = 'warning' }) => {
  const config = {
    warning: {
      icon: 'warning',
      iconColor: '#D32F2F',
      titleColor: '#D32F2F',
      buttonColor: '#D2A679',
    },
    success: {
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      titleColor: '#4CAF50',
      buttonColor: '#D2A679',
    }
  }[alertType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Ionicons name={config.icon} size={40} color={config.iconColor} style={styles.icon} />
          <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: config.buttonColor }]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAlert;