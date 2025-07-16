import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PasswordResetSuccess = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Contenedor tipo "modal" */}
      <View style={styles.modalBox}>
        <View style={styles.circleIcon}>
          <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>¡Correo enviado con éxito!</Text>
        
        <Text style={styles.message}>
          Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.
          Por favor revisa tu bandeja de entrada.
        </Text>
        
        <Image 
          source={require('../../assets/images/cinnami_logo.jpeg')}
          style={styles.illustration}
        />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
        
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CINNAMI — Confidencial</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const colors = {
  beigeClaro: '#FFF8F0',    // Fondo principal
  beigeMedio: '#F5E6D3',    // Variación
  beigeOscuro: '#E8D5B5',   // Bordes
  canela: '#D2A679',        // Botones y acentos
  canelaOscuro: '#B38A5E',  // Sombras
  textoOscuro: '#4A4A4A',   // Texto principal
  textoClaro: '#888888',     // Texto secundario
  success: '#A5C483',       // Verde suave que combina con beige
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beigeClaro,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    shadowColor: colors.canelaOscuro,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.beigeOscuro,
  },
  circleIcon: {
    backgroundColor: colors.success,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    borderWidth: 5,
    borderColor: colors.beigeClaro,
    shadowColor: colors.canelaOscuro,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.canela,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    color: colors.textoOscuro,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  illustration: {
    width: width * 0.5,
    height: width * 0.3,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.canela,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: colors.canelaOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textoClaro,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});

export default PasswordResetSuccess;