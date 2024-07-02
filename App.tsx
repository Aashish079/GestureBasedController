import {View, Text, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {WebSocketProvider} from './src/scripts/listen_broadcast';
import Sensors from './src/components/sensors';
import Lobby from './src/components/lobby';
import StackNavigator from './StackNavigator';
import {WebSocketProvider} from './src/scripts/listen_broadcast';

const App = () => {
  return (

    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Gesture Based Controller</Text>

          <WebSocketProvider>
            <Lobby />
            <Sensors />
          </WebSocketProvider>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    margin: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default App;
