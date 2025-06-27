import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Modal, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { globalStyles, colors } from '../../styles/globalStyles';

const ManageCardsScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [uid, setUid] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');
  const uidInputRef = useRef(null);

  const handleOpenForm = () => {
    setShowForm(true);
    setUid('');
    setError('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setUid('');
    setError('');
  };

  const handleSave = () => {
    if (!uid.trim()) {
      setError('ID de tarjeta es requerido');
      return;
    }

    const newCard = {
      id: Date.now(),
      number: uid.trim(),
      status: 'active',
    };

    setCards([...cards, newCard]);
    setUid('');
    setShowForm(false);
    setError('');
  };

  const toggleCardStatus = (cardId) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? { ...card, status: card.status === 'active' ? 'blocked' : 'active' }
        : card
    ));
  };

  const filteredCards = cards.filter(card =>
    card.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        uidInputRef.current?.focus();
      }, 200);
    }
  }, [showForm]);

  return (
    <>
      <ScrollView style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de Tarjetas</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleOpenForm}>
            <MaterialIcons name="add-circle-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.headerButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Buscar tarjeta por UID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {(searchQuery.trim() !== '' ? filteredCards : cards).map(card => (
          <View key={card.id} style={styles.card}>
            <Text style={styles.cardTitle}>ID de Tarjeta: {card.number}</Text>
            <Text style={styles.cardStatus}>
              Estado: {card.status === 'active' ? 'Activa' : 'Deshabilitada'}
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleStatusButton,
                { backgroundColor: card.status === 'active' ? colors.danger : colors.success }
              ]}
              onPress={() => toggleCardStatus(card.id)}
            >
              <FontAwesome5
                name={card.status === 'active' ? 'lock' : 'unlock'}
                size={16}
                color={colors.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.buttonText}>
                {card.status === 'active' ? 'Deshabilitar Tarjeta' : 'Habilitar Tarjeta'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelForm}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.subtitle}>Información de Tarjeta</Text>

              <View style={styles.inputBlock}>
                <View style={styles.labelRow}>
                  <FontAwesome5 name="id-card" size={18} color={colors.textLight} style={styles.icon} />
                  <Text style={styles.inputLabel}>ID de Tarjeta</Text>
                </View>
                <TextInput
                  ref={uidInputRef}
                  style={[
                    styles.inputFieldStyled,
                    error ? styles.inputErrorBorder : null
                  ]}
                  placeholder=""
                  value={uid}
                  onChangeText={(text) => {
                    setUid(text);
                    if (text.trim()) setError('');
                  }}
                />
                {error !== '' && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <Text style={styles.infoMessage}>
                Esta tarjeta quedará activa automáticamente. Podrás desactivarla desde el panel de administración si lo deseas.
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                  <FontAwesome5 name="save" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={handleCancelForm}>
                  <MaterialIcons name="close" size={20} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canela,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.darkBeige,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  cardStatus: {
    marginTop: 6,
    color: colors.textLight,
    fontSize: 14,
  },
  toggleStatusButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 10,
  },
  inputBlock: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  inputFieldStyled: {
    borderWidth: 1.5,
    borderColor: colors.darkBeige,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: colors.white,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  infoMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    marginTop: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: colors.canela,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ManageCardsScreen;