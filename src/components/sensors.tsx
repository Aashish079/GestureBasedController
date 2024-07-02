import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  subscribeAccelerometer,
  subscribeGyroscope,
  subscribeRawAcclerometer,
} from '../services/sensors';
import {useWebSocket} from '../scripts/listen_broadcast';
const Sensors = () => {
  const {ws} = useWebSocket();
  const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});
  const [acclero, setAcclero] = useState({x: 0, y: 0, z: 0});
  const [directionIndex, setDirectionIndex] = useState('Neutral');

  useEffect(() => {
    const subscriptionGyro = subscribeGyroscope(setGyro);

    const subscriptionRawAcclero = subscribeRawAcclerometer(setAcclero);

    const subscriptionAccelero = subscribeAccelerometer(setDirectionIndex);
    if (ws) {
      const data = {
        // gyroscope: gyro,
        // accelerometer: acclero,
        directionIndex: directionIndex,
      };
      ws.send(JSON.stringify(data));
    }
    return () => {
      subscriptionGyro.unsubscribe();
      subscriptionRawAcclero.unsubscribe();
      subscriptionAccelero.unsubscribe();
    };
  }, [directionIndex]);
  return (
    <View>
      <Text>Gyroscope Sensor</Text>
      <Text>X: {Math.round(gyro.x)}</Text>
      <Text>Y: {Math.round(gyro.y)}</Text>
      <Text>Z: {Math.round(gyro.z)}</Text>
      <Text>Acclerometer Sensor</Text>
      <Text>X: {Math.round(acclero.x)}</Text>
      <Text>Y: {Math.round(acclero.y)}</Text>
      <Text>Z: {Math.round(acclero.z)}</Text>

      <Text>Direction Index</Text>
      <Text> Direction : {directionIndex}</Text>
    </View>
  );
};

export default Sensors;
