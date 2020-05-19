// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var stateModule = require('./client/js/info.js');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

// Imposto la porta e i path predefiniti.
app.set('port', 4040);
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/client/index.html'));
  });


// Inizializzo il server.
server.listen(4040, function() {
    console.log('Starting server on port 4040');
  });

// Queste variabili contengono rispettivamente:
var SOCKET_LIST = {};                             // La lista delle socket dei rispettivi giocatori,
var playerNumber = 0;                             // Il numero dei giocatori,
var started = false;                              // Se la partita è iniziata,
var colors = stateModule.colorsList;              // La lista dei colori disponibili,
let states = stateModule.statesList;              // La lista degli stati della mappa,
let continents = stateModule.continentsList;      // La lista dei continenti della mappa,
let symbols = stateModule.symbolsList;            // La lista dei simboli,
let playerState = stateModule.playerStateList;    // La lista dei possibili stati dei giocatori.

// Costruttore Giocatori.
var Player = function (number,color,nick) {
  var self  = {
    number: number,
    color: color,
    states: [],
    simbols: [],
    bonus: 0,
    stateNumber: 0,
    nickname: nick,
    computationState: playerState.IDLE
  }

  Player.list[number] = self;
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
      number: player.number,
      color: player.color,
      states: player.states,
      simbols: player.simbols,
      bonus: player.bonus,
      stateNumber: player.stateNumber,
      nickname: player.nickname,
      computationState: player.computationState
    });
  }
  return infoGiocatori;
}

// Funzione che restituisce il giocatore data un criterio.
Player.find = function(search) {
  for (var i in Player.list) {
    var player = Player.list[i];
    // Posso cercare il giocatore per il numero.
    if (typeof search == "number") {
      if (player.number == search)
        return player;
    }
    // Posso cercare il giocatore per il nickname.
    else if (typeof search == "string") {
      if (player.nickname == search)
        return player;
    }
  }
  return null;
}

/*
// Funzione Per assegnare gli stati.
function assignState(player) {
  player.stateNumber =  Math.floor(Math.random() * 15);
  for(var i = 0; i < player.stateNumber; i++) {
    s = Math.floor(Math.random() * 30);

    player.states[i] = states[s];

    //controllo che non sia già stato assegnato
    for(var j = 0; j < player.states.length; j++) {
      if(player.states[j] != states[s]) {
        player.states[i] = states[s];
      }
      else {
        s = Math.floor(Math.random() * 30);
      }
    }
  }
}
*/

/*
  Funzione per assegnare inizialmente gli stati a tutti i giocatori.
  Se sono due giocatori allora assegnamo 21 stati l'uno; se sono 3 giocatori 14 stati ognuno;
  se sono 4 giocatori: 2 giocatori avranno 10 stati e gli altri due 11 stati.
*/
function assignStatePlayers() {
  // Il numero di stati dipende dal numero di giocatori.
  var number =  Math.floor(states.length / playerNumber);

  // Altre variabili utili.
  var player1;
  var player2;

  // Devo assegnare altri due stati a due giocatori casuali.
  if (playerNumber == 4) {
    player1 = Math.floor(Math.random() * playerNumber);
    player2 = Math.floor(Math.random() * playerNumber);

    // Così sono sicuro che player1 e 2 sono diversi.
    while (player2 == player1) {
      player2 = Math.floor(Math.random() * playerNumber);
    }
  }

  // Per ogni giocatore assegno il numero di stati corretti.
  for (var num = 0; num < playerNumber; num++) {
    // Recupero il player corrente e gli dico quanti stati gli do.
    var player = Player.find(num);

    // Se siamo 4 giocatori e il giocatore è uno dei fortunati avrà uno stato in più.
    if (player.number == player1 || player.number == player2) {
      player.stateNumber = number + 1;
    }

    // Altrimenti avrà il numero di stati che gli tocca.
    else {
      player.stateNumber = number;
    }
    
    // Gli assegno gli stati.
    for(var i = 0; i < player.stateNumber; i++) {
      var assigned = 0;
      s = Math.floor(Math.random() * states.length);

      // Finchè assegnato è 0, ho trovato solo stati già assegnati.
      while (assigned == 0) {
        // Se lo stato non ha già un possessore glielo assegno.
        if (states[s].owner == null) {
          player.states.push(states[s]);
          states[s].owner = player.number;
          assigned = 1;
        }

        else {
          s = Math.floor(Math.random() * states.length);
        }
      }
    }
  }
}

// Questa è la funzione che invia i nuovi valori dei giocatori ai client in modo che sia tutto sincronizzato.
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
  
  console.log('New Connection ' + socketID);

  // Viene richiamata quando un giocatore si registra alla partita.
  socket.on('newPlayer', function(data) {
    // Se ci sono già 2 giocatori o la partita è iniziata.
    if (playerNumber == 2 || started) {
      // Dico al client che siamo al completo.
      socket.emit("full");
      return;
    }

    var nickname = data.nick;
  
    // Se non c'è già un giocatore con il nick inserito.
    if(!Player.find(nickname)) {
      // Altrimenti creo una variabile player e aumento il numero dei giocatori.
      var player = Player(playerNumber,colors[playerNumber],nickname);
      playerNumber++;

      // Se ci sono due giocatori assegno gli stati.
      if (playerNumber == 2) {
        assignStatePlayers();
      }

      // Invio ai client alcune informazioni e sanno che devono attendere.
      socket.emit('playerAccepted');
    }

    // Altrimenti dico che il nick è già preso.
    else
      socket.emit('nickNotAvailable');
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

  //Viene richiamata quando un client clicca su uno stato suo
  socket.on('myState',function(data){
    //data è la posizione attuale del client

    //cosa può fare ora il client? 
    //1.muovere le truppe al territorio selezionato
    // se si comunico che può muovere le truppe
    socket.emit('replymyState',1);

    //2.aggiungere le truppe al territorio selezionato
    // se si comunico che può aggiungere le truppe
    socket.emit('replymyState',2);

  });

  //Viene richiamata quando un client clicca su uno stato non suo
  socket.on('notmyState', function(data){
    //data è la posizione attuale del client

  //cosa può fare ora il client? 
  //1. può attaccare?
  // se si lo comunico
  socket.emit('replynotmyState',0);
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
