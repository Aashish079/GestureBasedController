import React, { useState, useEffect } from 'react';
import {
  View,
  Text,

  BackHandler,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  subscribeAccelerometer,
  subscribeGyroscope,
  subscribeRawAcclerometer,
} from '../services/sensors';
import { useWebSocket } from '../scripts/listen_broadcast';
const Sensors = ({ navigation }) => {
  const { socket, isConnected, setIsConnected } = useWebSocket();

  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [acclero, setAcclero] = useState({ x: 0, y: 0, z: 0 });
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
      const data = { directionIndex: directionIndex };
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected, directionIndex, dataToSend]);

  useEffect(() => {
    if (!isConnected || dataToSend !== 'gyroAcclero') return;
    if (socket) {
      const data = { gyroscope: gyro, accelerometer: acclero };
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

      <TouchableOpacity
        style={[
          styles.deviceContainer,
          dataToSend === 'gyroAcclero' && styles.activeDeviceContainer,
        ]}
        onPress={() => setDataToSend('gyroAcclero')}>
        <View>
          <Text>Gyro and Acclero</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.deviceContainer,
          dataToSend === 'directionIndex' && styles.activeDeviceContainer,
        ]}
        onPress={() => setDataToSend('directionIndex')}>
        <View>
          <Text>Direction Index</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  deviceContainer: {
    margin: 5,
    paddingLeft: 110,
    paddingVertical: 15,

    borderBottomWidth: 1,
    backgroundColor: '#5C8EAD',
    borderBottomColor: '#fff',
  },
  activeDeviceContainer: {
    backgroundColor: '#283044',
  },
  text: {
    color: '#fff',
  },
});
export default Sensors;
