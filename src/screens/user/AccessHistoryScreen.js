// src/screens/user/AccessHistoryScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import AccessLogItem from '../../components/AccessLogItem';

const AccessHistoryScreen = () => {
  const accessHistory = [
    { id: 1, door: 'Puerta Principal', time: '10:30 AM', date: '15 Jun 2023', status: 'Exitoso' },
    { id: 2, door: 'Puerta Secundaria', time: '09:15 AM', date: '15 Jun 2023', status: 'Exitoso' },
    { id: 3, door: 'Puerta Principal', time: '04:45 PM', date: '14 Jun 2023', status: 'Exitoso' },
    { id: 4, door: 'Puerta Principal', time: '08:30 AM', date: '14 Jun 2023', status: 'Exitoso' },
    { id: 5, door: 'Puerta Secundaria', time: '06:20 PM', date: '13 Jun 2023', status: 'Fallido' },
  ];

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Mi Historial de Accesos</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={[styles.filterText, styles.activeFilterText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Exitosos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Fallidos</Text>
        </TouchableOpacity>
      </View>
      
      {accessHistory.map(access => (
        <AccessLogItem
          key={access.id}
          name={access.door}
          time={access.time}
          date={access.date}
          status={access.status}
          showDoor={false}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.canela,
    width: '30%',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: colors.canela,
  },
  filterText: {
    color: colors.canela,
  },
  activeFilterText: {
    color: colors.white,
  },
});

export default AccessHistoryScreen;