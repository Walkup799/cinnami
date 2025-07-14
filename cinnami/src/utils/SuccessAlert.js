import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SuccessAlert = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  onConfirm, 
  type = 'success',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar' 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#629460', 
          borderColor: '#629460', 
        };
      case 'confirm':
        return {
          icon: 'help-circle',
          iconColor: '#b08968', // Canela oscuro
          borderColor: '#b08968', // Canela oscuro
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#F39C12',
          borderColor: '#F39C12',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: '#E74C3C',
          borderColor: '#E74C3C',
        };
      case 'info':
        return {
          icon: 'information-circle',
          iconColor: '#727d71',
          borderColor: '#727d71',
        };
      default:
        return {
          icon: 'checkmark-circle',
          iconColor: '#27AE60',
          borderColor: '#27AE60',
        };
    }
  };

  const { icon, iconColor, borderColor } = getIconAndColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View 
            style={[
              styles.alertContainer,
              { borderTopColor: borderColor },
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons 
                  name={icon} 
                  size={32} 
                  color={iconColor} 
                  style={styles.icon}
                />
                <Text style={styles.title}>{title}</Text>
              </View>
              
              <Text style={styles.message}>{message}</Text>
              
              {type === 'confirm' ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.confirmButton, { backgroundColor: borderColor }]}
                    onPress={onConfirm}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>{confirmText}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: borderColor }]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  alertContainer: {
    backgroundColor: '#F5F5DC', // Beige claro
    borderRadius: 15,
    borderTopWidth: 4,
    width: width * 0.85,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f5539', // Canela oscuro
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B4423', // Canela medio
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  confirmButton: {
    flex: 1,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SuccessAlert;