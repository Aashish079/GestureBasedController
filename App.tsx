import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import React from 'react';
import Sensors from './components/sensors';

const App = () => {
  return (
    <ScrollView>
      <SafeAreaView>
        <View style={{margin: 20}}>
          <Text>React-Native-Sensor</Text>

          <Sensors />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default App;
