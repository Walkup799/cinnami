import { StyleSheet } from 'react-native';

export const colors = {
  canela: '#D2A679',
  beige: '#F5E6D3',
  white: '#FFFFFF',
  darkBeige: '#E8D5B5',
  textDark: '#4A3F35',
  textLight: '#7A6E5F',
  danger: '#bc8a5f', // rojo?
  success: '#a4ac86',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.canela,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.darkBeige,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.darkBeige,
    borderTopWidth: 1,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
});