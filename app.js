var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  cors: {
    origin: '*'
  }
});
var path = require('path');
var port = 3131;

const activeConnections = {};

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, 'static')));

io.on('connection', (socket) => {

  socket.on('command', ({ command, connectionKey }) => {
    if (command === 'submit') {
      socket.broadcast.emit(`readAIData/${connectionKey}`, { ...activeConnections[connectionKey], command });
      delete activeConnections[connectionKey];
    }
    if (command === 'getData') {
      socket.emit(`readAIData/${connectionKey}`, activeConnections[connectionKey]);
    }
  });

  socket.on('readAIData', ({ data, user, connectionKey }) => {
    const object = {
      ...activeConnections[connectionKey]
    };
    if (data) { object.data = data; }
    if (user) { object.user = user; }

    activeConnections[connectionKey] = object;
    socket.broadcast.emit(`readAIData/${connectionKey}`, activeConnections[connectionKey]);
  });
});


http.listen(port, () => {
	console.log('listening on *:', port);
});