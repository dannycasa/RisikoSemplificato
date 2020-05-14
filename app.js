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
var SOCKET_LIST = {};
var playerNumber = 0;
var started = false;
// I colori sono verde, rosso, giallo e blu.
var colori = ['#00ff00', '#ff0000', '#ffff00', '#0000ff'];

// Costruttore Giocatori.
var Player = function (number,color,nick,id) {
  var self  = {
    number:number,
    color:color,
    states: {},
    simbols: {},
    nickname:nick,
    id:id
  }

  Player.list[id] = self;
  return self;
}

Player.list = {};
Player.onConnect = function(socket) {
  var player = Player.list[socket.id];
}

Player.onDisconnect = function (socket) {
  delete Player.list[socket.id];
}

Player.update = function(socket) {
  var infoGiocatori = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    infoGiocatori.push({
      number:player.number,
      color:player.color,
      states: player.states,
      simbols: player.simbols,
      nickname:player.nick,
      id:player.id
    });
  }
  return infoGiocatori;
}

io.on('connection', function(socket) {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  console.log(socket.id);

  socket.on('new player', function(data) {
    // Se ci sono già 4 giocatori o la partita è iniziata.
    if (playerNumber == 4 || started) {
      // Dico al client che siamo già al completo.
      socket.emit("full");
      return;
    }

    var player = Player(playerNumber,colori[playerNumber],data.nick,socket.id);

    playerNumber++;

    // Invio ai client alcune informazioni e sanno che devono attendere.
    socket.emit('player-info', {
      msg:player,
    });
  });

  // Questa viene richiamata quando un client si disconnette.
  socket.on('disconnect', function() {
    // Rimuovo il client dalla lista di socket e dei giocatori.
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket.id);

    // Informo gli altri che un giocatore è andato offline. La partita viene interrotta.
    for (var i in SOCKET_LIST) {
      var socket = SOCKET_LIST[i];
      socket.emit("end-offline");
    }
  });

  socket.on('sendMsgToServer', function(data) {
    var playerName = Player.list[socket.id].nick;

    for (var i in SOCKET_LIST) {
      SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
    }
  });

});

setInterval(function() {
  var infoGiocatori = Player.update();
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('update', infoGiocatori);
  }
}, 1000 / 60);