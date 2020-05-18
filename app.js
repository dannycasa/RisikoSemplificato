// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var stateModule = require('./client/js/states.js');


var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 4040);
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
var colors = stateModule.colorsList;
let states = stateModule.statesList;
let continents = stateModule.continentsList;
let symbols = stateModule.symbolsList;


// Costruttore Giocatori.
var Player = function (number,color,nick,id) {
  var self  = {
    number:number,
    color:color,
    states: [],
    simbols: [],
    bonus: 0,
    stateNumber: 0,
    nickname:nick,
    id:id,///////////////A CHE SERVE SE C'è GIA NUMBER
    computation_state: "IDLE"
  }

  Player.list[id] = self;
  return self;
}

Player.list = {};

Player.onDisconnect = function (sockID) {
  delete Player.list[sockID];
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
      nickname:player.nickname,
      id:player.id,///////////////A CHE SERVE SE C'è GIA NUMBER
      computation_state:player.computation_state
    });
  }
  return infoGiocatori;
}

// Funzione Per assegnare gli stati.
function assignState(player) {
  player.stateNumber = Math.floor(Math.random() * 15);
  for(var i = 0 ; i < player.stateNumber ; i++) {
    s = Math.floor(Math.random() * 30);
    player.states[i] = states[s];
  
    //controllo che non sia già stato assegnato
    for(var j = 0; j<player.states.length; j++) {
      if(player.states[j] != states[s]) {
        player.states[i] = states[s];
      }
      else {
        s = Math.floor(Math.random() * 30);
      }
    }
    
  }
}

function update() {
  var infoGiocatori = Player.update();
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('update', infoGiocatori);
  }
}

io.on('connection', function(socket) {
  // Ad ogni connessione, do un id alla socket e la aggiungo alla lista delle socket.
  socket.id = Math.random();
  let socketID = socket.id;
  SOCKET_LIST[socket.id] = socket;
  
   // Viene richiamata quando un giocatore si registra alla partita.
   socket.on('newPlayer', function(data) {
    // Se ci sono già 2 giocatori o la partita è iniziata. //debug 2
    if (playerNumber == 2|| started) {
      // Dico al client che siamo al completo.
      socket.emit("full");
      return;
    }

    // Altrimenti creo una variabile player e aumento il numero dei giocatori.
    var player = Player(playerNumber,colors[playerNumber],data.nick,socket.id);
    playerNumber++;

    // Invio ai client alcune informazioni e sanno che devono attendere.
    socket.emit('playerInfo', {
      msg:player,
    });
  });

  // Viene richiamata quando un client si disconnette.
  socket.on('disconnect', function() {    
    // Rimuovo il client dalla lista di socket e dei giocatori.
    delete SOCKET_LIST[socketID];
    Player.onDisconnect(socketID);

    // Se la partita è iniziata informo gli altri che un giocatore è andato offline. La partita viene interrotta.
    if (started) {
      for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit("endOffline");
      }
    }
  });

  // Viene richiamata quando un client vuole aggiungere truppe al suo territorio.
  socket.on ('addTroops', function(data) {
    var player = data.player;
    var troop = data.troop;
    var state = data.state;

    var state1 = states.find(item=>item.name==state);
    // Se il player che mi ha mandato la richiesta è l'effettivo possessore.
    if (player.nickname == state.owner) {
      // Aggiungo il carro armato.
      state1.troops++;
      socket.emit("troopAdded");
      update();
    }

    // Altrimenti non possiede il territorio.
    else {
      socket.emit("noOwner", "move"); 
    }
  });

  // Viene richiamata quando un client vuole spostare truppe da un territorio all'altro.
  socket.on('moveTroops', function(data) {
    var player = data.player;
    var initialState = data.state1;
    var endState = data.state2;
    var troops = data.troop;

    var state1 = states.find(item=>item.name==initialState);
    var state2 = states.find(item=>item.name==endState);

    // Se il player che mi ha mandato la richiesta è il possessore di entrambi i territori.
    if ((player.nickname == state1.owner) && (player.nickname == state2.owner)) {
      // Se il territorio di partenza ha effettivamente tali truppe e il giocatore lascia almeno un carro armato.
      if (state1.troop > troops) {
        state1.troop = state1.troop - troops;
        state2.troop = state2.troop + troops;
        socket.emit("movedTroops");
        update();
      }
      // Se non ha abbastanza truppe lo avviso.
      else {
        socket.emit("noTroops");
      }
    }

    // Altrimenti non possiede almeno uno dei due territori.
    else {
      socket.emit("noOwner", "move");
    }
  });

  socket.on('attackPlayer', function(data) {
    var attacker = data.attacker;
    var defender = data.defender;
    var troop = data.troop;
    var attackerState = data.state1;
    var defenderState = data.state2;

    var state1 = states.find(item=>item.name==attackerState);
    var state2 = states.find(item=>item.name==defenderState);

    // Controllo che lo stato che sta attaccando sia effettivamente dell'attaccante 
    // e che lo stato che sta difendendo sia effettivamente del difensore.
    if ((attacker.nickname == state1.owner) && (defender.nickname == state2.owner)) {
      // Controllo che sia lo stato che attacca che quello che difende abbiano abbastanza truppe.      
      if ((state1.troop > troops) && (state2.troop >= troops)) {
        // Creo e riempio gli array che contengono il lancio dei dadi.
        var attackerDice = [];
        var defenderDice = [];
        for (var i = 0; i < troop; i++) {
          attackerDice[i] = Math.round(Math.random() * 5) + 1;
          defenderDice[i] = Math.round(Math.random() * 5) + 1;
        }

        // Ordino gli array in ordine decrescente.
        attackerDice.sort(function(a, b) {
          return b - a;
        });
        defenderDice.sort(function(a, b) {
          return b - a;
        });

        var clashesWon = 0;
        // Controllo chi vince lo scontro.
        for (var i = 0; i < troop; i++) {
          if (attackerDice[i] > defenderDice[i])
            clashesWon++;
        }

        // Se l'attaccante vince tutti gli scontri.
        if (clashesWon == troop) {
          // In questo caso l'attaccante ha conquistato lo stato.
          if (state2.troop == troop) {
            state2.owner = attacker.nickname;

            // Pesco una carta simbolo.
            var index = Math.round(Math.random() * 4);
            players.find(item=>item.nickname==attacker.nickname).symbol.push[symbols[index]];

            // Avviso l'attaccante che ha conquistato lo stato.
            socket.emit("stateWon", {
              name: defenderState,
              symbol: symbols[index]
            });

            // Avviso il difensore che ha perso lo stato.
            var sock = defender.id;
            SOCKET_LIST[sock].emit("stateLost", {
              name: defenderState,
              player: attacker
            })
          }
        }

        // Altrimenti l'attacco è fallito.
        else {
          // In questo caso lo stato resta al possessore.
          socket.emit("stateNotWon", {
            player: defender,
            battleWon: clashesWon,
            totalBattle: troop,
            name: defenderState
          });
        }
        update();
      }

      // Se il numero di truppe non va bene allora avviso l'utente 
      else {
        socket.emit("noTroops");
      }
    }

    // Altrimenti non possiede almeno uno dei due territori.
    else {
      socket.emit("noOwner", "attack");    
    }
  });

  // Viene richiamata quando un client invia un messaggio in chat.
  socket.on('sendMsgToServer', function(data) {
    var playerName = Player.list[socket.id].nick;
    // Invio a tutti i client il messaggio.
    for (var i in SOCKET_LIST) {
      SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
    }
  });

  // Viene richiamata quando viene inviato un messaggio di "debug".
  socket.on('evalServer', function(data) {
    var res = eval(data);
    socket.emit('evalAnswer',res);
  });
});
