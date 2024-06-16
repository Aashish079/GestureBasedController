import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Lobby from './src/components/lobby';
import Sensors from './src/components/sensors';

type RootStackParamList = {
  Lobby: undefined;
  Sensors: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Lobby">
        <Stack.Screen name="Lobby" component={Lobby} />
        <Stack.Screen name="Sensors" component={Sensors} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
