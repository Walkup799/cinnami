import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles, colors } from '../../styles/globalStyles';

const CardStatusScreen = () => {
  const [cardBlocked, setCardBlocked] = useState(false);
  const [temporaryBlock, setTemporaryBlock] = useState(false);
  const [blockDuration, setBlockDuration] = useState('1');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleBlockCard = () => {
    if (temporaryBlock) {
      alert(`Tarjeta bloqueada temporalmente por ${blockDuration} hora(s)`);
    } else {
      alert(cardBlocked ? 'Tarjeta desbloqueada' : 'Tarjeta bloqueada permanentemente');
    }
    setCardBlocked(!cardBlocked);
    setLastUpdate(new Date());
  };

  const handleDurationPress = (hours) => {
    Alert.alert(
      'Confirmar bloqueo',
      `¿Está seguro que desea bloquear esta tarjeta por ${hours} hora(s)?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: () => {
            setBlockDuration(hours);
            setCardBlocked(true);
            setTemporaryBlock(true);
            setLastUpdate(new Date());
            alert(`Tarjeta bloqueada temporalmente por ${hours} hora(s)`);
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={globalStyles.container}>
      <View style={[globalStyles.card, { alignItems: 'center' }]}>
        <Text style={[globalStyles.subtitle, { fontSize: 22 }]}>Estado de tu tarjeta</Text>

        <Icon
          name="credit-card-chip"
          size={100}
          color={cardBlocked ? colors.danger : colors.success}
          style={{ marginVertical: 10 }}
        />

        <Text
          style={[
            globalStyles.title,
            {
              fontSize: 32,
              color: cardBlocked ? colors.danger : colors.success,
            },
          ]}
        >
          {cardBlocked ? 'BLOQUEADA' : 'ACTIVA'}
        </Text>

        <View
          style={[
            styles.statusChip,
            { backgroundColor: cardBlocked ? colors.danger : colors.success },
          ]}
        >
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>
            {cardBlocked ? 'Bloqueada' : 'Activa'}
          </Text>
        </View>

        <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 6 }}>
          Último cambio: {formatDate(lastUpdate)}
        </Text>
      </View>

      <View style={[globalStyles.card, { marginTop: 20 }]}>
        <View style={styles.headerRow}>
          <Text style={globalStyles.subtitle}>Opciones de bloqueo</Text>
          <TouchableOpacity
            onPress={() =>
              alert(
                'El bloqueo temporal desactiva tu tarjeta por unas horas. El permanente es indefinido hasta que lo desbloquees.'
              )
            }
          >
            <Icon name="information-outline" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.optionRow}>
          <Icon name="calendar-clock" size={20} color={colors.canela} style={{ marginRight: 10 }} />
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
                    { backgroundColor: colors.canela },
                  ]}
                  onPress={() => handleDurationPress(hours)}
                >
                  <Text style={styles.durationText}>{hours} h</Text>
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
              backgroundColor: colors.canela,
            },
          ]}
          onPress={handleBlockCard}
        >
          <Text style={globalStyles.buttonText}>
            {cardBlocked
              ? 'Desbloquear Tarjeta'
              : temporaryBlock
              ? 'Bloquear Temporalmente'
              : 'Bloquear Permanentemente'}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    padding: 10,
    borderRadius: 5,
    width: '23%',
    alignItems: 'center',
  },
  durationText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
});

export default CardStatusScreen;