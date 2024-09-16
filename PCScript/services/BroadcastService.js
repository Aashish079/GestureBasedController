const dgram = require('dgram');
const os = require('os');
const {Netmask} = require('netmask');
const {Buffer} = require('buffer');

class BroadcastService {
  constructor(broadcastingPort, broadcastingDelay, webSocketPort) {
    this.broadcastingPort = broadcastingPort;
    this.broadcastingDelay = broadcastingDelay;
    this.webSocketPort = webSocketPort;
    this.udpSocket = null;
    this.isStarted = false;
  }

  start() {
    this.initializeUDPSocket();
    this.startBroadcasting();
  }

  initializeUDPSocket() {
    try {
      this.udpSocket = dgram.createSocket('udp4');
      this.udpSocket.on('error', this.handleSocketError.bind(this));
      this.udpSocket.bind(() => {
        this.udpSocket.setBroadcast(true);
        console.log('UDP socket created and bound to port', this.broadcastingPort);
      });
    } catch (error) {
      console.error('Failed to initialize UDP socket:', error);
    }
  }

  startBroadcasting() {
    setInterval(() => {
      if (!this.isStarted) {
        this.broadcast();
      }
    }, this.broadcastingDelay);
  }

  broadcast() {
    const message = this.createBroadcastMessage();
    const buffer = Buffer.from(message);

    try {
      const broadcastAddress = this.getBroadcastAddress();
      this.udpSocket.send(
        buffer,
        0,
        buffer.length,
        this.broadcastingPort,
        broadcastAddress,
        this.handleBroadcastError.bind(this)
      );
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  createBroadcastMessage() {
    const osInfo = `${os.platform()}${os.release()}`;
    const username = `${this.getUsername()}-${osInfo}`;
    return `${username};;${this.webSocketPort}`;
  }

  getUsername() {
    return os.userInfo().username;
  }

  getBroadcastAddress() {
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

  handleSocketError(err) {
    console.error('UDP socket error:', err);
    this.udpSocket.close();
  }

  handleBroadcastError(err) {
    if (err) {
      console.error('Error broadcasting:', err);
    }
  }
}

module.exports = BroadcastService;