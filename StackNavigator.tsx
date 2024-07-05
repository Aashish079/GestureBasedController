import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Lobby from './src/components/lobby';
import Sensors from './src/components/sensors';
import {WebSocketProvider} from './src/scripts/listen_broadcast';

type RootStackParamList = {
  Lobby: undefined;
  Sensors: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <WebSocketProvider>
        <Stack.Navigator initialRouteName="Lobby">
          <Stack.Screen name="Lobby" component={Lobby} />
          <Stack.Screen
            name="Sensors"
            component={Sensors}
            options={{headerLeft: null}}
          />
        </Stack.Navigator>
      </WebSocketProvider>
    </NavigationContainer>
  );
};

export default StackNavigator;
