import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import React from 'react';
import Sensors from './src/components/sensors';
import Lobby from './src/components/lobby';

const App = () => {
  return (
    <ScrollView>
      <SafeAreaView>
        <View style={{margin: 20}}>
          <Text>React-Native-Sensor</Text>
<Lobby/>
          {/* <Sensors /> */}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default App;
