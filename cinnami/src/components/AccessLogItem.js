import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../styles/globalStyles';

const AccessLogItem = ({ name, cardNumber, time, date, door }) => {
  return (
    <View style={[globalStyles.card, { marginBottom: 10 }]}>
      <Text style={styles.name}>{name} ({cardNumber})</Text>
      <Text style={styles.detail}>{door} • {time} • {date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  name: {
    fontWeight: 'bold',
    color: colors.textDark,
    fontSize: 16,
  },
  detail: {
    color: colors.textLight,
    marginTop: 5,
  },
});

export default AccessLogItem;