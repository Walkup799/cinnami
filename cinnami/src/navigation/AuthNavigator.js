import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import { colors } from '../styles/globalStyles';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PasswordResetSuccess from '../screens/PasswordResetSuccess';
import ResetPasswordScreen from '../screens/ResetPasswordScreen'; // Asegúrate de importar el nuevo screen

const Stack = createStackNavigator();

const AuthNavigator = ({ setUserRole }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.beige,
        },
        headerTitleStyle: {
          color: colors.textDark,
        },
        headerTintColor: colors.canela,
      }}
    >
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        
        {props => <LoginScreen {...props} setUserRole={setUserRole} />}
      </Stack.Screen>


      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Recuperar contraseña' }}
      />
      <Stack.Screen
        name="PasswordResetSuccess"
        component={PasswordResetSuccess}
        options={{ title: 'Recuperar contraseña' }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: 'Restablecer contraseña' }}
      />

    </Stack.Navigator>
  );
};

export default AuthNavigator;