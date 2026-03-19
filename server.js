const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });
const clients = new Map();

wss.on('connection', (ws) => {
  let myId = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.t === 'register' && msg.id) {
        myId = msg.id;
        clients.set(myId, ws);
        ws.send(JSON.stringify({ t: 'registered', id: myId }));
        return;
      }

      if (msg.to && msg.from) {
        const target = clients.get(msg.to);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify(msg));
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    if (myId) clients.delete(myId);
  });
});

console.log('mesh signaling server running on port', PORT);
