import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { globalStyles, colors } from '../../styles/globalStyles';

const ManageCardsScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [uid, setUid] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');

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

  return (
    <>
      <ScrollView style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <View style={styles.headerRow}>
          <Text style={globalStyles.title}>Gestión de Tarjetas</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleOpenForm}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={16}
              color={colors.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.headerButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={globalStyles.input}
          placeholder="Buscar tarjeta por UID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.trim() !== '' ? (
          filteredCards.length > 0 ? (
            filteredCards.map(card => (
              <View key={card.id} style={[globalStyles.card, { padding: 20 }]}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>ID de Tarjeta: {card.number}</Text>
                <Text style={{ marginTop: 6, color: colors.textLight }}>
                  Estado: {card.status === 'active' ? 'Activa' : 'Deshabilitada'}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.toggleStatusButton,
                    { backgroundColor: card.status === 'active' ? colors.danger : colors.success }
                  ]}
                  onPress={() => toggleCardStatus(card.id)}
                >
                  <FontAwesome
                    name={card.status === 'active' ? 'lock' : 'unlock'}
                    size={16}
                    color={colors.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={globalStyles.buttonText}>
                    {card.status === 'active' ? 'Deshabilitar Tarjeta' : 'Habilitar Tarjeta'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textLight, marginTop: 10 }}>
              No se encontró ninguna tarjeta con ese ID.
            </Text>
          )
        ) : (
          cards.map(card => (
            <View key={card.id} style={[globalStyles.card, { padding: 20 }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>ID de Tarjeta: {card.number}</Text>
              <Text style={{ marginTop: 6, color: colors.textLight }}>
                Estado: {card.status === 'active' ? 'Activa' : 'Deshabilitada'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.toggleStatusButton,
                  { backgroundColor: card.status === 'active' ? colors.danger : colors.success }
                ]}
                onPress={() => toggleCardStatus(card.id)}
              >
                <FontAwesome
                  name={card.status === 'active' ? 'lock' : 'unlock'}
                  size={16}
                  color={colors.white}
                  style={{ marginRight: 6 }}
                />
                <Text style={globalStyles.buttonText}>
                  {card.status === 'active' ? 'Deshabilitar Tarjeta' : 'Habilitar Tarjeta'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
              <Text style={[globalStyles.subtitle, { fontWeight: 'bold', color: colors.textDark, marginBottom: 10 }]}>
                Información de Tarjeta
              </Text>

              <View style={[styles.inputGroup, error ? styles.inputErrorBorder : null]}>
                <FontAwesome name="id-card" size={18} color={colors.textLight} style={styles.icon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="ID de Tarjeta"
                  value={uid}
                  onChangeText={(text) => {
                    setUid(text);
                    if (text.trim()) setError('');
                  }}
                  autoFocus
                />
              </View>
              {error !== '' && <Text style={styles.errorText}>{error}</Text>}

              <Text style={styles.infoMessage}>
                Esta tarjeta quedará activa automáticamente. Podrás desactivarla desde el panel de administración si lo deseas.
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <FontAwesome name="save" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={[globalStyles.buttonText, { color: colors.white }]}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelForm}>
                  <MaterialIcons name="cancel" size={20} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={[globalStyles.buttonText, { color: colors.white }]}>Cancelar</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  headerButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkBeige,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    height: 45,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 8,
    marginLeft: 5,
  },
  infoMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 50,  // Más ancho
  },
  cancelButton: {
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  toggleStatusButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ManageCardsScreen;
