import React, {useState, useEffect} from 'react';
import {View, Text, Button, BackHandler, StyleSheet,TouchableOpacity} from 'react-native';
import {
  subscribeAccelerometer,
  subscribeGyroscope,
  subscribeRawAcclerometer,
} from '../services/sensors';
import {useWebSocket} from '../scripts/listen_broadcast';
const Sensors = ({navigation}) => {
  const {socket, isConnected, setIsConnected} = useWebSocket();
  const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});
  const [acclero, setAcclero] = useState({x: 0, y: 0, z: 0});
  const [dataToSend, setDataToSend] = useState('directionIndex');
  const [directionIndex, setDirectionIndex] = useState('Neutral');

  useEffect(() => {
    const backAction = () => {
      setIsConnected(false);
      navigation.navigate('Lobby');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    const subscriptionGyro = subscribeGyroscope(setGyro);

    const subscriptionRawAcclero = subscribeRawAcclerometer(setAcclero);

    const subscriptionAccelero = subscribeAccelerometer(setDirectionIndex);

    return () => {
      subscriptionGyro.unsubscribe();
      subscriptionRawAcclero.unsubscribe();
      subscriptionAccelero.unsubscribe();
    };
  }, [isConnected]);
  useEffect(() => {
    if (!isConnected || dataToSend !== 'directionIndex') return;
    if (socket) {
      const data = {directionIndex: directionIndex};
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected, directionIndex, dataToSend]);

  useEffect(() => {
    if (!isConnected || dataToSend !== 'gyroAcclero') return;
    if (socket) {
      const data = {gyroscope: gyro, accelerometer: acclero};
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected, gyro, acclero, dataToSend]);
  return (
    <View style={styles.container}>
      <Text>Gyroscope Sensor</Text>
      <Text>X: {Math.round(gyro.x)}</Text>
      <Text>Y: {Math.round(gyro.y)}</Text>
      <Text>Z: {Math.round(gyro.z)}</Text>
      <Text>Acclerometer Sensor</Text>
      <Text>X: {Math.round(acclero.x)}</Text>
      <Text>Y: {Math.round(acclero.y)}</Text>
      <Text>Z: {Math.round(acclero.z)}</Text>

      <Text>Direction Index</Text>
      <Text>Direction : {directionIndex}</Text>
      <Button  style={styles.button}
        title="Gyro and Acclero"
        onPress={() => setDataToSend('gyroAcclero')}
      />
      <Button  style={styles.button}
        title="Direction Index"
        onPress={() => setDataToSend('directionIndex')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  button: {
   
    backgroundColor: 'lightblue',
    padding: 10,
    margin: 5,
  },
  selectedButton: {
   
    backgroundColor: 'blue',
    color: 'white',
  },
});
export default Sensors;
