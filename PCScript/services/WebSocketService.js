const WebSocket = require('ws');
const robot = require('robotjs');

class WebSocketService {
  constructor(port) {
    this.port = port;
    this.wss = null;
    this.connectedUsers = {};
  }

  start() {
    this.wss = new WebSocket.Server({port: this.port});
    this.wss.on('listening', this.handleListening.bind(this));
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  handleListening() {
    console.log(`WebSocket server started on port ${this.port}`);
  }

  handleConnection(ws, req) {
    const mouseController = new MouseController();
    const queryParams = new URLSearchParams(req.url.split('?')[1]);
    const username = queryParams.get('username');
    const id = ws._socket.remotePort;

    if (username) {
      this.connectedUsers[id] = username;
      ws.send(`SocketId:${id}`);
      console.log(`Client connected with username: ${username}, id: ${id}`);
    } else {
      console.log(`Client connected with id: ${id}`);
    }

    ws.on('message', message => this.handleMessage(message, mouseController));
    ws.on('close', () => this.handleClose(id));
  }

  handleMessage(message, mouseController) {
    const messageObj = JSON.parse(message);

    if (messageObj.directionIndex) {
      this.handleDirectionChange(messageObj.directionIndex);
    } else if (messageObj.gyroscope && messageObj.accelerometer) {
      mouseController.updatePosition(
        messageObj.gyroscope,
        messageObj.accelerometer,
        messageObj.button,
      );
    }
  }

  handleDirectionChange(direction) {
    console.log(direction);
    if (direction === 'Left') {
      robot.keyTap('left');
      // console.log('Left arrow key pressed');
    } else if (direction === 'Right') {
      robot.keyTap('right');
      //console.log('Right arrow key pressed');
    } else if (direction === 'Neutral') {
      //  console.log('Neutral position, no key pressed');
    }
  }

  handleClose(id) {
    if (this.connectedUsers[id]) {
      console.log(
        `Client disconnected with username: ${this.connectedUsers[id]}, id: ${id}`,
      );
      delete this.connectedUsers[id];
    } else {
      console.log(`Client disconnected with id: ${id}`);
    }
  }
}

class MouseController {
  constructor() {
    this.gyroSensitivityX = 50;
    this.gyroSensitivityY = -20;
    this.accelSensitivityX = 0.0;
    this.accelSensitivityY = -0.1;
    this.alpha = 0.8;
    this.deadZone = 0.001;
    this.filteredAccelX = 0;
    this.filteredAccelY = 0;
    this.windowSize = 5;
    this.xWindow = new Array(this.windowSize).fill(0);
    this.yWindow = new Array(this.windowSize).fill(0);
    this.windowIndex = 0;
  }

  updatePosition(gyro, accel, button) {
    const gyroDeltaX = gyro.y * this.gyroSensitivityX;
    const gyroDeltaY = gyro.x * this.gyroSensitivityY;
    let currentX = robot.getMousePos().x;
    let currentY = robot.getMousePos().y;

    this.filteredAccelX = this.lowPassFilter(this.filteredAccelX, accel.x);
    this.filteredAccelY = this.lowPassFilter(this.filteredAccelY, accel.y);
    const accelDeltaX =
      this.applyDeadZone(this.filteredAccelX, this.deadZone) *
      this.accelSensitivityX;
    const accelDeltaY =
      this.applyDeadZone(this.filteredAccelY, this.deadZone) *
      this.accelSensitivityY;

    const deltaX = gyroDeltaX + accelDeltaX;
    const deltaY = gyroDeltaY + accelDeltaY;
    const smoothDeltaX = this.movingAverage(this.xWindow, deltaX);
    const smoothDeltaY = this.movingAverage(this.yWindow, deltaY);

    currentX += smoothDeltaX;
    currentY += smoothDeltaY;
    console.log(button);
    
    if (button === 'L') {
      robot.mouseClick('left');
    } else if (button === 'R') {
      robot.mouseClick('right');
    }
    robot.moveMouse(Math.round(currentX), Math.round(currentY));
  }

  applyDeadZone(value, threshold) {
    return Math.abs(value) < threshold ? 0 : value;
  }

  movingAverage(window, newValue) {
    window[this.windowIndex] = newValue;
    this.windowIndex = (this.windowIndex + 1) % this.windowSize;
    return window.reduce((sum, val) => sum + val, 0) / this.windowSize;
  }

  lowPassFilter(oldValue, newValue) {
    return oldValue * this.alpha + newValue * (1 - this.alpha);
  }
}

module.exports = WebSocketService;
