import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
// import {map} from 'rxjs/operators';

const Sensors = () => {

  const [accelero, setAccelero] = useState({x: 0, y: 0, z: 0});
  const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});

  useEffect(() => {
    const updateInterval = 400;
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateInterval);

    const subscriptionGyro = gyroscope.subscribe(({x, y, z}) => {
      setGyro({x, y, z});
    });

    const subscriptionAccelero = accelerometer
      .subscribe(({x, y, z}) => {
        setAccelero({x, y, z});
      });

    return () => {
      subscriptionGyro.unsubscribe();
      subscriptionAccelero.unsubscribe();
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
