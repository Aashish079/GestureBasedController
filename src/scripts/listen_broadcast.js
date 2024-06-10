import dgram from 'react-native-udp';
import {WebSocket} from 'ws';
import {NativeModules} from 'react-native';
const {WifiManager} = NativeModules;

function enableMulticastLock() {
  if (WifiManager && WifiManager.acquireMulticastLock) {
    WifiManager.acquireMulticastLock();
  }
}
function releaseMulticastLock() {
  if (WifiManager && WifiManager.releaseMulticastLock) {
    WifiManager.releaseMulticastLock();
  }
}

const BROADCAST_PORT = 9732;
// const USERNAME = 'Gesture';
const addressPortSet = new Set();

enableMulticastLock();
function listenForBroadcast(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const udpSocket = dgram.createSocket({
      type: 'udp4',
      debug: true,
    });
    udpSocket.bind(BROADCAST_PORT);

    udpSocket.on('listening', () => {
      const address = udpSocket.address();
      console.log(`Listening for broadcasts on port ${address.port}`);
    });

    udpSocket.on('message', (message, remote) => {
      const data = message.toString('ascii');
      const [name, ws_port] = data.split(';;');

      const key = `${name}@${remote.address}:${ws_port}`;

      if (!addressPortSet.has(key)) {
        console.log(
          `Received broadcast from ${remote.address}:${remote.port} - ${data}`,
        );
        console.log('Host Name:', name);
        console.log('Web-Socket port:', ws_port);
        addressPortSet.add(key);
      }
    });

    udpSocket.on('error', err => {
      console.log(`UDP socket error: ${err.message}`);
      releaseMulticastLock();
      udpSocket.close();
      reject(err);
    });

    setTimeout(() => {
      releaseMulticastLock();
      udpSocket.close();
      resolve(addressPortSet);
    }, timeout);
  });
}

async function connectToServer(host, port, username) {
  const uri = `ws://${host}:${port}`;
  console.log(`Connecting to WebSocket server at ${uri}`);

  const websocket = new WebSocket(uri);

  websocket.on('open', () => {
    console.log('Connected to server');
    websocket.send(`username=${username}`);
  });

  websocket.on('message', message => {
    console.log(`Received message: ${message}`);
  });

  websocket.on('close', () => {
    console.log('Disconnected from server');
  });

  websocket.on('error', error => {
    console.error(`WebSocket error: ${error}`);
  });
}

// listenForBroadcast();
export {listenForBroadcast, connectToServer};
