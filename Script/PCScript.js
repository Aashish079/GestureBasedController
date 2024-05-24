const WebSocket = require('ws');
const robot = require('robotjs');

const wss = new WebSocket.Server({port: 4080});

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'accelero') {
      console.log('Received accelerometer data:', data.data);
      const {x} = data.data;
      if (x < 0) {
        // Simulating "next" action
        robot.keyTap('right');
      } else if (x > 0) {
        // Simulating "previous" action
        robot.keyTap('left');
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
