import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import { map, pairwise, filter } from 'rxjs/operators';

const threshold = 20;
const updateInterval = 80;
setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);
setUpdateIntervalForType(SensorTypes.gyroscope, updateInterval);

export const subscribeGyroscope = setGyro => {
  return gyroscope.subscribe(({ x, y, z }) => {
    setGyro({ x, y, z });
  });
};
export const subscribeRawAcclerometer = setRawAccelero => {
  return accelerometer.subscribe(({ x, y, z }) => {
    setRawAccelero({ x, y, z });
  });
};

// const lowPassFilter = alpha => {
//   let filteredValue = 0;
//   return newValue => {
//     filteredValue = alpha * newValue + (1 - alpha) * filteredValue;
//     return filteredValue;
//   };
// };

// export const subscribeAccelerometer = setDirectionIndex => {
//   const alpha = 0.3;
//   const filtero = lowPassFilter(alpha);

//   return accelerometer
//     .pipe(
//       map(({x}) => x),
//       map(filtero),
//       pairwise(),
//       map(x => x.reduce((acc, curr) => acc + curr, 0)),
//       filter(x => Math.abs(x) > threshold),
//     )
//     .subscribe({
//       next: x => {
//         setDirectionIndex(x > 0 ? 'Left' : 'Right');
//         setTimeout(() => {
//           setDirectionIndex('Neutral');
//         }, 1200);
//       },
//       error: err => console.log(err),
//     });
// };

export const subscribeAccelerometer = setDirectionIndex => {
  return accelerometer
    .pipe(
      map(({ x }) => x),
      pairwise(),
      map(x =>
        x.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      ),
      filter(x => Math.abs(x) > threshold),
    )
    .subscribe({
      next: x => {
        setDirectionIndex(x > 0 ? 'Left' : 'Right');

        setTimeout(() => {
          setDirectionIndex('Neutral');
        }, 1200);
      },
      error: err => console.log(err),
    });
};
