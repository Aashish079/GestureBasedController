import dgram from 'node:dgram';

import {WebSocket} from 'ws';

const BROADCAST_PORT = 9732;
const USERNAME = 'Gesture';
// const addressPortSet = new Set();
async function listenForBroadcast() {
  const udpSocket = dgram.createSocket('udp4');
  udpSocket.bind(BROADCAST_PORT);
  udpSocket.on('listening', () => {
    const address = udpSocket.address();
    console.log(`Listening for broadcasts on port ${address.port}`);
  });

  udpSocket.on('message', async (message, remote) => {
    const data = message.toString('ascii');
    const key = `${remote.address}:${remote.port}`;

    // Display unique and keep checking of availability of old
    // if (!addressPortSet.has(key)) {
    console.log(
      `Received broadcast from ${remote.address}:${remote.port} - ${data}`,
    );

    const [name, port] = data.split(';;');
    console.log('Host Name', name);
    console.log('Web-Socket port', port);

    // addressPortSet.add(key);
    // }

    await connectToServer(remote.address, parseInt(port, 10), USERNAME);
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

listenForBroadcast();
