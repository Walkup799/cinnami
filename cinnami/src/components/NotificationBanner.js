import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const NotificationBanner = ({ message, visible, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  text: {
    color: colors.white,
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
  },
});

export default NotificationBanner;