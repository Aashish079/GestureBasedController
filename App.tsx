import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import React from 'react';
import {WebSocketProvider} from './src/scripts/listen_broadcast';
import Sensors from './src/components/sensors';
import Lobby from './src/components/lobby';

const App = () => {
  return (
    <ScrollView>
      <SafeAreaView>
        <View style={{margin: 20}}>
          <Text>React-Native-Sensor</Text>

          <WebSocketProvider>
            <Lobby />
            <Sensors />
          </WebSocketProvider>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default App;
