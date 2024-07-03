import dgram from 'dgram';
import WebSocket from 'ws';
import os from 'os';
import {Netmask} from 'netmask';
import robot from 'robotjs';
import {Buffer} from 'buffer';

const BROADCASTING_PORT = 9732;
const BROADCASTING_DELAY = 3000;
const WEB_SOCKET_PORT = 9648;

let udpSocket = dgram.createSocket('udp4');
let broadcastingTimer = 0;
let isStarted = false;
let connectedUsers = {};

function getUsername() {
  const username = os.userInfo().username;
  return username;
}

function getBroadcastAddress() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        const block = new Netmask(`${alias.address}/${alias.netmask}`);
        return block.broadcast;
      }
    }
  }
  throw new Error('No suitable network interface found.');
}

function startBroadcasting() {
  setInterval(() => {
    if (!isStarted) {
      broadcast();
    }
  }, BROADCASTING_DELAY);
}

function broadcast() {
  const osInfo = `${os.platform()}${os.release()}`;
  const username = `${getUsername()}-${osInfo}`;
  const message = `${username};;${WEB_SOCKET_PORT}`;
  const buffer = Buffer.from(message);

  udpSocket.setBroadcast(true);
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
}

const wss = new WebSocket.Server({port: WEB_SOCKET_PORT});

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

    if (message === 'left') {
      robot.keyTap('left');
      console.log('Left arrow key pressed');
    } else if (message === 'right') {
      robot.keyTap('right');
      console.log('Right arrow key pressed');
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
