const WebSocket = require('ws');
const robot = require('robotjs');

const wss = new WebSocket.Server({port: 4080});

console.log('WebSocket server is starting...');

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    try {
      console.log('Received message:', message);
      const data = JSON.parse(message);
      if (data.type === 'accelero') {
        console.log('Received accelerometer data:', data.data);
        const {x} = data.data;
        if (x < 0) {
          // Simulating "next" action
          // robot.keyTap('right');
          console.log('right');
        } else if (x > 0) {
          // Simulating "previous" action
          // robot.keyTap('left');
          console.log('left');
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

wss.on('listening', () => {
  console.log(`WebSocket server is listening on port ${wss.options.port}`);
});

wss.on('error', error => {
  console.error('WebSocket server error:', error);
});

console.log('WebSocket server setup complete.');
