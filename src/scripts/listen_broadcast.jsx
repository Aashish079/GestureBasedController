import { createContext, useState, useContext } from 'react';
    import dgram from 'react-native-udp';

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

 const [socket, setSocket] = useState(null);
 const [isConnected, setIsConnected] = useState(false);
  const connectToServer = (ip, port, username) => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://${ip}:${port}?username=${username}`);
      ws.onopen = () => {
        setSocket(ws);
        setIsConnected(true);
        resolve();
      };
      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
      };
      ws.onmessage = message => {
        console.log(`Received message: ${message.data}`);
      };
      ws.onerror = error => {
        setIsConnected(false);
        reject(error);
      };
    });
  };

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, connectToServer, setIsConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
