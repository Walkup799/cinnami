import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import AccessLogItem from '../../components/AccessLogItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const FILTERS = [
  { label: 'Todos', value: 'all', icon: 'list' },
  { label: 'Exitosos', value: 'exitosos', icon: 'checkmark-circle' },
  { label: 'Fallidos', value: 'fallidos', icon: 'close-circle' },
];

const AccessHistoryScreen = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [doors, setDoors] = useState([]);
  const [animation] = useState(new Animated.Value(0));

  // Animación al entrar a la pantalla
  useFocusEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => animation.setValue(0);
  });

  const headerTransform = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        }),
      },
    ],
    opacity: animation,
  };

  // Load user profile
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) setUserProfile(JSON.parse(userData));
    };
    loadUser();
  }, []);

  // Fetch doors from backend
  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/doors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar las puertas');
        const data = await response.json();
        setDoors(data.doors || []);
      } catch (e) {
        setDoors([]);
      }
    };
    fetchDoors();
  }, []);

  // Fetch user access logs and map door info
  useEffect(() => {
    const fetchUserAccessLogs = async () => {
      if (!userProfile?._id) return;
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/access-events/user/${userProfile._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar los accesos');
        const data = await response.json();
        // Mapear para mostrar info de la puerta
        const mapped = (data.accessLogs || []).map(ev => {
          const door = doors.find(d => d._id === ev.doorId || d.doorId === ev.doorId);
          return {
            id: ev._id,
            door: door?.name || ev.doorName || ev.door || 'Puerta desconocida',
            doorState: door?.state || '-',
            time: new Date(ev.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: new Date(ev.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: (ev.result === 'allowed' || ev.result === 'granted' || ev.status === 'Exitoso') ? 'Exitoso' : 'Fallido',
            timestamp: new Date(ev.timestamp),
          };
        });
        // Ordenar por fecha (más reciente primero)
        mapped.sort((a, b) => b.timestamp - a.timestamp);
        setAccessLogs(mapped);
      } catch (e) {
        setAccessLogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAccessLogs();
  }, [userProfile, doors]);

  const filteredLogs = accessLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'exitosos') return log.status === 'Exitoso';
    if (filter === 'fallidos') return log.status === 'Fallido';
    return true;
  });

  // Agrupar accesos por fecha
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const dateKey = log.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {});

 return (
    <View style={[globalStyles.container, styles.container]}>
      <Animated.View style={[styles.header, headerTransform]}>
        <Text style={styles.title}>Historial de Accesos</Text>
        <Text style={styles.subtitle}>Registro de tus movimientos</Text>
      </Animated.View>

      <View style={styles.filterContainer}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterButton, 
              filter === f.value && styles.activeFilter,
              { borderColor: colors.canela }
            ]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={f.icon} 
              size={20} 
              color={filter === f.value ? colors.white : colors.canela} 
              style={{ marginRight: 5 }} 
            />
            <Text style={[
              styles.filterText, 
              filter === f.value ? styles.activeFilterText : { color: colors.canela }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.canela} />
          <Text style={[styles.loadingText, { color: colors.canelaDark }]}>Cargando tu historial...</Text>
        </View>
      ) : filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={60} color={colors.canelaLight} />
          <Text style={[styles.emptyText, { color: colors.canelaDark }]}>No hay registros de acceso</Text>
          <Text style={[styles.emptySubtext, { color: colors.canelaLight }]}>Tus accesos aparecerán aquí</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Ionicons name="calendar" size={18} color={colors.canela} />
                <Text style={[styles.dateText, { color: colors.canela }]}>{date}</Text>
              </View>
              {logs.map((access, index) => (
                <AccessLogItem
                  key={`${access.id}-${index}`}
                  name={access.door}
                  time={access.time}
                  date={access.date}
                  status={access.status}
                  doorState={access.doorState}
                  showDoor={false}
                  isFirst={index === 0}
                  isLast={index === logs.length - 1}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.beige,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: colors.beige,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.canelaDark,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.canela,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  activeFilter: {
    backgroundColor: colors.canela,
    borderColor: colors.canelaDark,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.canela,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default AccessHistoryScreen;