import React, {useState, useEffect} from 'react';
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
      <View style={styles.textContainer}>
        <TouchableOpacity
          style={[
            styles.mode,
            dataToSend === 'gyroAcclero' && styles.activeMode,
          ]}
          onPress={() => setDataToSend('gyroAcclero')}>
          <View>
            <Text>Gyro and Acclero</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mode,
            dataToSend === 'directionIndex' && styles.activeMode,
          ]}
          onPress={() => setDataToSend('directionIndex')}>
          <View>
            <Text> Direction Index </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  mode: {
    flexDirection: 'row',
    margin: 5,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    borderBottomWidth: 1,

    borderBottomColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C9365A',
  },
  activeMode: {
    backgroundColor: '#871D34',
  },

  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
export default Sensors;
