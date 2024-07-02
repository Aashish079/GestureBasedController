const dgram = require('dgram');
const WebSocket = require('ws');
const os = require('os');

const BROADCASTING_PORT = 9752;
const BROADCASTING_DELAY = 3000; // 3 seconds
let WEB_SOCKET_PORT = 9648; // This can be made configurable
console.log('Script Started');
let connectedUsers = {};
let isStarted = false;

// Create and bind UDP socket with error handling
const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', err => {
  console.error('UDP socket error:', err);
  udpSocket.close();
});

udpSocket.bind(BROADCASTING_PORT, err => {
  if (err) {
    console.error('Failed to bind UDP socket:', err);
    return;
  }
  console.log('UDP socket created and bound to port', BROADCASTING_PORT);
  udpSocket.setBroadcast(true);
});

// Create WebSocket server with error handling
const webSocketServer = new WebSocket.Server({port: WEB_SOCKET_PORT});

webSocketServer.on('error', err => {
  console.error('WebSocket server error:', err);
});

webSocketServer.on('listening', () => {
  console.log(`WebSocket server is listening on port ${WEB_SOCKET_PORT}`);
});

webSocketServer.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const username = params.get('username');
  console.log('Username:', username);
  const id = req.socket.remotePort;

  if (username) {
    connectedUsers[id] = username;
    ws.send(`SocketId:${id}`);
    console.log(`Client connected with username: ${username}, id: ${id}`);
  } else {
    console.log(`Client connected with id: ${id}`);
  }

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
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

function getUserName() {
  const envUsername = process.env.USERNAME || process.env.USER || null;
  if (envUsername) {
    return envUsername;
  } else {
    const homeDir = os.homedir();
    const homeDirParts = homeDir.split('/');
    return homeDirParts[homeDirParts.length - 1];
  }
}

function broadcastMessage() {
  const osInfo = `${os.type()}-${os.release()}`;
  const name = `${getUserName()}-${osInfo}`;
  const message = `${name};;${WEB_SOCKET_PORT}`;
  const messageBuffer = Buffer.from(message);

  udpSocket.send(
    messageBuffer,
    0,
    messageBuffer.length,
    BROADCASTING_PORT,
    '255.255.255.255',
    err => {
      if (err) {
        console.error('Error broadcasting:', err);
      }
    },
  );
}

setInterval(() => {
  if (!isStarted) {
    broadcastMessage();
  }
}, BROADCASTING_DELAY);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', input => {
  if (input.trim() === 'start') {
    isStarted = true;
    const messageBuffer = Buffer.from('GameStart');
    webSocketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageBuffer);
      }
    });
  }
});
