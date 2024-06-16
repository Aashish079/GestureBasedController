import dgram from 'react-native-udp';
import {createContext, useState, useContext} from 'react';

const BROADCAST_PORT = 9732;

const addressPortSet = new Set();

export function listenForBroadcast(timeout = 5000) {
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

      udpSocket.close();
      reject(err);
    });

    setTimeout(() => {
      udpSocket.close();
      resolve(addressPortSet);
    }, timeout);
  });
}

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
  const [ws, setWs] = useState(null);

  const connectToServer = async (host, port, username) => {
    const uri = `ws://${host}:${port}`;
    console.log(`Connecting to WebSocket server at ${uri}`);

    const websocket = new WebSocket(uri);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('Connected to server');
      websocket.send(`username=${username}`);
    };

    websocket.onmessage = message => {
      console.log(`Received message: ${message.data}`);
    };

    websocket.onclose = () => {
      console.log('Disconnected from server');
      setWs(null);
    };

    websocket.onerror = error => {
      console.error(`WebSocket error: ${error}`);
    };
  };

  return (
    <WebSocketContext.Provider value={{ws, connectToServer}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
