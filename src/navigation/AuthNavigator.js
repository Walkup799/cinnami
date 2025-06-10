import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import { colors } from '../styles/globalStyles';

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
    </Stack.Navigator>
  );
};

export default AuthNavigator;