import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {bufferCount, filter, map, pairwise, tap} from 'rxjs/operators';

const Sensors = () => {
  const threshold = 20;
  const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});
  const [directionIndex, setDirectionIndex] = useState('Neutral');
  // const [directionLogs, setDirectionLogs] = useState([]);
  useEffect(() => {
    const updateInterval = 50;
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateInterval);

    const subscriptionGyro = gyroscope.subscribe(({x, y, z}) => {
      setGyro({x, y, z});
    });

    const subscriptionAccelero = accelerometer
      .pipe(
        map(({x}) => x),
        pairwise(),

        map(x =>
          x.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          ),
        ),

        filter(x => Math.abs(x) > threshold),
      )

      .subscribe({
        next: x => {
          setDirectionIndex(x > 0 ? 'Left' : 'Right');
          // setDirectionLogs(prev => [...prev, directionIndex]);
          setTimeout(() => {
            // console.log(directionIndex);
            setDirectionIndex('Neutral');
          }, 1200);
        },
        error: err => console.log(err),
      });

    return () => {
      subscriptionGyro.unsubscribe();
      subscriptionAccelero.unsubscribe();
    };
  }, [directionIndex]);
  return (
    <View>
      <Text>Gyroscope Sensor</Text>
      <Text>X: {Math.round(gyro.x)}</Text>
      <Text>Y: {Math.round(gyro.y)}</Text>
      <Text>Z: {Math.round(gyro.z)}</Text>

      <Text>Direction Index</Text>
      <Text> Direction : {directionIndex}</Text>
      {/* {directionLogs.map((log, index) => (
        <Text key={index}>{log}</Text>
      ))} */}
    </View>
  );
};

export default Sensors;
