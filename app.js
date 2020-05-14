// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/client/index.html'));
  });


// Starts the server.
server.listen(4040, function() {
    console.log('Starting server on port 4040');
  });

  // Add the WebSocket handlers
var players = {};

io.on('connection', function(socket) {

  socket.on('new player', function(data) {
    console.log(data.nick);
    socket.nickname = data.nick;
    socket.x = 0;
    socket.y = 0;
    players[socket.id] = socket;
  });

  socket.on('disconnect', function() {
    delete players[socket.id];
  })
  
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });
});

setInterval(function() {
  for (var i in players) {
    var socket = players[i];
    socket.x++;
    socket.y++;
    socket.emit('newPosition', {
      x:socket.x,
      y:socket.y,
    });
  }
}, 1000 / 60);