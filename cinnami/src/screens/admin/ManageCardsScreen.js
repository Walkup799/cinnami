// src/screens/admin/ManageCardsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import CardItem from '../../components/CardItem';

const ManageCardsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([
    { id: 1, number: 'A1B2C3', owner: 'Juan Pérez', status: 'active' },
    { id: 2, number: 'X4Y5Z6', owner: 'María García', status: 'active' },
    { id: 3, number: 'M7N8O9', owner: 'Carlos López', status: 'blocked' },
    { id: 4, number: 'P0Q1R2', owner: 'Ana Martínez', status: 'active' },
  ]);

  const handleBlockCard = (cardId) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, status: card.status === 'active' ? 'blocked' : 'active' } 
        : card
    ));
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const filteredCards = cards.filter(card =>
    card.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Gestión de Tarjetas</Text>
      
      <TextInput
        style={globalStyles.input}
        placeholder="Buscar tarjeta o usuario..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Registrar Nueva Tarjeta</Text>
      </TouchableOpacity>
      
      {filteredCards.map(card => (
        <CardItem
          key={card.id}
          cardNumber={card.number}
          ownerName={card.owner}
          status={card.status}
          onBlock={() => handleBlockCard(card.id)}
          onDelete={() => handleDeleteCard(card.id)}
          isAdmin
        />
      ))}
    </ScrollView>
  );
};

export default ManageCardsScreen;