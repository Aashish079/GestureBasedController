const dgram = require('dgram');
const WebSocket = require('ws');
const os = require('os');
const {Netmask} = require('netmask');
const robot = require('robotjs');
const {Buffer} = require('buffer');

const BROADCASTING_PORT = 9732;
const BROADCASTING_DELAY = 3000;
const WEB_SOCKET_PORT = 9648;

let udpSocket;
let broadcastingTimer = 0;
let isStarted = false;
let connectedUsers = {};

function getUsername() {
  return os.userInfo().username;
}

function getBroadcastAddress() {
  const interfaces = os.networkInterfaces();
  // console.log('Available network interfaces:', interfaces);

  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        const block = new Netmask(`${alias.address}/${alias.netmask}`);
        console.log(`Using interface ${iface} with broadcast address ${block.broadcast}`);
        return block.broadcast;
      }
    }
  }
  throw new Error('No suitable network interface found.');
}

function startBroadcasting() {
  try {
    udpSocket = dgram.createSocket('udp4');

    udpSocket.on('error', err => {
      console.error('UDP socket error:', err);
      udpSocket.close();
    });

    udpSocket.bind(() => {
      udpSocket.setBroadcast(true);
      console.log('UDP socket created and bound to port', BROADCASTING_PORT);
    });

    setInterval(() => {
      if (!isStarted) {
        broadcast();
      }
    }, BROADCASTING_DELAY);
  } catch (error) {
    console.error('Failed to initialize UDP socket:', error);
  }
}

function broadcast() {
  const osInfo = `${os.platform()}${os.release()}`;
  const username = `${getUsername()}-${osInfo}`;
  const message = `${username};;${WEB_SOCKET_PORT}`;
  const buffer = Buffer.from(message);

  try {
    const broadcastAddress = getBroadcastAddress();
    udpSocket.send(
      buffer,
      0,
      buffer.length,
      BROADCASTING_PORT,
      broadcastAddress,
      err => {
        if (err) {
          console.error('Error broadcasting:', err);
        }
      },
    );
  } catch (error) {
    console.error('Failed to broadcast message:', error);
  }
}

const wss = new WebSocket.Server({port: WEB_SOCKET_PORT});

wss.on('listening', () => {
  console.log(`WebSocket server started on port ${WEB_SOCKET_PORT}`);
});

wss.on('connection', (ws, req) => {
  const queryParams = new URLSearchParams(req.url.split('?')[1]);
  const username = queryParams.get('username');
  const id = ws._socket.remotePort;

  if (username) {
    connectedUsers[id] = username;
    ws.send(`SocketId:${id}`);
    console.log(`Client connected with username: ${username}, id: ${id}`);
  } else {
    console.log(`Client connected with id: ${id}`);
  }

  ws.on('message', message => {
    console.log(`Received message: ${message}`);

    //Obtained message is string so converting into JSON
    const messageObj = JSON.parse(message);
    console.log(messageObj.directionIndex);

    if (messageObj.directionIndex === 'Left') {
      robot.keyTap('left');
      console.log('Left arrow key pressed');
    } else if (messageObj.directionIndex === 'Right') {
      robot.keyTap('right');
      console.log('Right arrow key pressed');
    } else if (messageObj.directionIndex === 'Neutral') {
      console.log('Neutral position, no key pressed');
    }
  });

  ws.on('close', () => {
    if (connectedUsers[id]) {
      console.log(
        `Client disconnected with username: ${connectedUsers[id]}, id: ${id}`,
      );
      delete connectedUsers[id];
    } else {
      console.log(`Client disconnected with id: ${id}`);
    }
  });
});

function startWebSocketServer() {
  wss.on('listening', () => {
    console.log(`WebSocket server started on port ${WEB_SOCKET_PORT}`);
  });
}

startBroadcasting();
startWebSocketServer();

console.log('Server is running...');
