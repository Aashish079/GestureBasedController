import React, {useState, useEffect} from 'react';
import {NetworkInfo} from 'react-native-network-info';
import {View, Text} from 'react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
// import {map} from 'rxjs/operators';

const Sensors = () => {
  const [accelero, setAccelero] = useState({x: 0, y: 0, z: 0});
  const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    //Creating a websocket instance
    NetworkInfo.getIPAddress().then(ip => {
      const ws = new WebSocket(`ws://${ip}:4080`);
      ws.onopen = () => {
        setSocket(ws);
      };
    });
    const updateInterval = 400;
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateInterval);

    const subscriptionGyro = gyroscope.subscribe(({x, y, z}) => {
      setGyro({x, y, z});
    });

    const subscriptionAccelero = accelerometer.subscribe(({x, y, z}) => {
      setAccelero({x, y, z});

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: 'accelero', data: {x, y, z}})); //Sending the accelerometer data to the server
      }
    });

    return () => {
      subscriptionGyro.unsubscribe();
      subscriptionAccelero.unsubscribe();
      ws.close(); //Closing the websocket connection
    };
  }, []);

  return (
    <View>
      <Text>Gyroscope Sensor</Text>
      <Text>X: {Math.round(gyro.x)}</Text>
      <Text>Y: {Math.round(gyro.y)}</Text>
      <Text>Z: {Math.round(gyro.z)}</Text>

      <Text>Accelerometer Sensor</Text>
      <Text>X: {Math.round(accelero.x)}</Text>
      <Text>Y: {Math.round(accelero.y)}</Text>
      <Text>Z: {Math.round(accelero.z)}</Text>
    </View>
  );
};

export default Sensors;
