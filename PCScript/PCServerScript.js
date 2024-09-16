const dgram = require('dgram');
const WebSocket = require('ws');
const os = require('os');
const { Netmask } = require('netmask');
const robot = require('robotjs');
const { Buffer } = require('buffer');

const BROADCASTING_PORT = 9732;
const BROADCASTING_DELAY = 3000;
const WEB_SOCKET_PORT = 9648;

let udpSocket;

let isStarted = false;
let connectedUsers = {};

function getUsername() {
  return os.userInfo().username;
}

function getBroadcastAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (iface === 'Wi-Fi' && alias.family === 'IPv4' && !alias.internal) {
        const block = new Netmask(`${alias.address}/${alias.netmask}`);

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


const wss = new WebSocket.Server({ port: WEB_SOCKET_PORT });

wss.on('listening', () => {
  console.log(`WebSocket server started on port ${WEB_SOCKET_PORT}`);
});

wss.on('connection', (ws, req) => {

  const gyroSensitivityX = 50;
  const gyroSensitivityY = 20;
  const accelSensitivityX = 0.5;
  const accelSensitivityY = 0.5;
  const alpha = 0.8;

  let filteredAccelX = 0;
  let filteredAccelY = 0;

  function lowPassFilter(oldValue, newValue) {
    return oldValue * alpha + newValue * (1 - alpha);
  }




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
  // here




  ws.on('message', message => {
    const messageObj = JSON.parse(message);

    if (messageObj.directionIndex) {
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
    } else if (messageObj.gyroscope && messageObj.accelerometer) {
      // Handle sensor data
      const gyro = messageObj.gyroscope;
      const acclero = messageObj.accelerometer;
      const gyroDeltaX = gyro.y * gyroSensitivityX;
      const gyroDeltaY = gyro.x * gyroSensitivityY;
      let currentX = robot.getMousePos().x;
      let currentY = robot.getMousePos().y;
      // Process accelerometer data
      filteredAccelX = lowPassFilter(filteredAccelX, acclero.x);
      filteredAccelY = lowPassFilter(filteredAccelY, acclero.y);
      const accelDeltaX = filteredAccelX * accelSensitivityX;
      const accelDeltaY = filteredAccelY * accelSensitivityY;

      // Combine gyroscope and accelerometer data
      const deltaX = gyroDeltaX + accelDeltaX;
      const deltaY = gyroDeltaY + accelDeltaY;

      // Update current position
      currentX += deltaX;
      currentY += deltaY

      robot.moveMouse(Math.round(currentX), Math.round(currentY));





      // let mouseX = robot.getMousePos().x + Math.round(gyro.x * sensitivity);
      // let mouseY = robot.getMousePos().y + Math.round(gyro.y * sensitivity);
      // robot.moveMouse(mouseX, mouseY);

      // if (acclero.z < -10) {
      //   robot.mouseClick('left');
      // } else if (acclero.z > 10) {
      //   robot.mouseClick('right');
      // }
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
