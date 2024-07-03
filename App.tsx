import {View, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import React from 'react';

import StackNavigator from './StackNavigator';

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <StackNavigator />
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
