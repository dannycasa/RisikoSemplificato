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
let playerTurn;                                   // Indica di quale giocatore è il turno.

// Costruttore Giocatori.
var Player = function (number, color, nick, id) {
  var self  = {
    id: id,
    number: number,
    color: color,
    states: [],
    symbols: [],
    bonus: 0,
    stateNumber: 0,
    nickname: nick,
    computationState: playerState.IDLE,
    troop: 0
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
      id: player.id,
      number: player.number,
      color: player.color,
      states: player.states,
      symbols: player.symbols,
      bonus: player.bonus,
      stateNumber: player.stateNumber,
      nickname: player.nickname,
      computationState: player.computationState,
      troop: player.troop
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
  Funzione per assegnare inizialmente gli stati a tutti i giocatori.
  Se sono due giocatori allora assegnamo 21 stati l'uno; se sono 3 giocatori 14 stati ognuno;
  se sono 4 giocatori: 2 giocatori avranno 10 stati e gli altri due 11 stati.
*/
Player.assignStatePlayers = function () {
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
          states[s].owner = player.nickname;
          assigned = 1;
        }

        else {
          s = Math.floor(Math.random() * states.length);
        }
      }
    }
  }
}

// Funzione per cambiare il turno, changed indica se devo cambiare turno, playerState indica lo stato in cui devo muovere il player.
Player.changeTurn = function(changed, pState, player) {
  // Modifico il turno.
  if (changed) {
    playerTurn = (playerTurn + 1) % playerNumber;
  }

  for (var i in Player.list) {
    var p = Player.list[i];

    // Se è cambiato il turno e sono il giocatore designato allora il mio stato diventa ASSIGN.
    if (changed && p.number == playerTurn) {
      p.computationState = playerState.ASSIGN;
      // Do le truppe che gli spettano al mio giocatore.
      p.troop = Math.floor(p.states.length / 3) + p.state.bonus;
    }

    // Se non è cambiato il turno e sono il giocatore indicato allora il mio stato diventa quello passato come argomento.
    else if ((!changed) && (p.nickname == player.nickname))  {
      p.computationState = pState;
    }

    // In ogni altro caso pongo/mantengo il mio stato in WAITER.
    else {
      p.computationState == playerState.WAITER;
    }
  }
}

// Conto il numero di simboli richiesti in possesso dall'utente.
Player.countSymbol = function(symbol, player, array) {
  var count = (input, arr) => arr.filter(x => x == input).length;

  // Guardo quante volte sono presenti i simboli nell'array.
  countCannoni = count(symbols.Cannone, player.symbols);
  countFanti = count(symbols.Fante, player.symbols);
  countCavalieri = count(symbols.Cavaliere, player.symbols);
  
  // Se cerchiamo un tris di cannoni.
  if (symbol == symbols.Cannone && countCannoni >= 3) {
    return true;
  }

  // Se cerchiamo un tris di fanti.
  else if (symbol == symbols.Fante && countFanti >= 3) {
    return true;
  }

  // Se cerchiamo un tris di cavalieri.
  else if (symbol == symbols.Cavaliere && countCavalieri >= 3) {
    return true;
  }

  // Se cerchiamo tutti simboli diversi.
  else if (symbol == symbols.Diversi) {
    if ((countCannoni > 0) && (countFanti > 0) && (countCavalieri > 0)) {
      return true;
    }
  }

  // Se cerchiamo due elementi uguali ed uno diverso.
  else if (symbol == symbols.Jolly) {
    // Se voglio la combinazione due cannoni e un fante.
    if ((array[0] == symbols.Cannone) && array[1] == symbols.Fante) {
      if ((countCannoni >=2) && (countFanti != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due cannoni e un cavaliere.
    else if ((array[0] == symbols.Cannone) && array[1] == symbols.Cavaliere) {
      if ((countCannoni >=2) && (countCavalieri != 0)) {
        return true;
      }
    }

    // Se voglio la combinazione due fanti e un cannone.
    else if ((array[0] == symbols.Fante) && array[1] == symbols.Cannone) {
      if ((countFanti >=2) && (countCannoni != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due fanti e un cavaliere.
    else if ((array[0] == symbols.Fante) && array[1] == symbols.Cavaliere) {
      if ((countFanti >=2) && (countCavalieri != 0)) {
        return true;
      }
    }

    // Se voglio la combinazione due cavalieri e un cannone.
    else if ((array[0] == symbols.Cavaliere) && array[1] == symbols.Cannone) {
      if ((countCavalieri >=2) && (countCannoni != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due cavaliere e un fante.
    else if ((array[0] == symbols.Cavaliere) && array[1] == symbols.Fante) {
      if ((countCavalieri >=2) && (countFanti != 0)) {
        return true;
      }
    }
  }

  // Se non viene soddisfatta la quantità richiesta restituisco false.
  return false;
}

Player.removeSymbol = function(symbol, player, array) {
  // Se devo rimuovere un tris di simboli.
  if ((symbol == symbols.Cannone) || (symbol == symbols.Cannone) || (symbol == symbols.Cannone)) {
    for (var i = 0; i < 3; i++) {
      for (var s = 0; s < player.symbols.length; s++) {
        if (player.symbols[s] == symbol) {
          delete player.symbols[s];
          break;
        }
      }
    }
  }

  // Se devo rimuovere un simbolo per ogni tipo.
  else if (symbol == symbols.Diversi) {
    var d = [symbols.Cannone, symbols.Cavaliere, symbols.Fante];

    for (var i = 0; i < 3; i++) {
      for (var s = 0; s < player.symbols.length; s++) {
        if (player.symbols[s] == d[i]) {
          delete player.symbols[s];
          break;
        }
      }
    }
  }

  // Se devo rimuovere due simboil di un tipo e uno di un'altro.
  else if (symbol == symbols.Jolly) {
    var count1 = 2;
    var count2 = 1;
    for (var i = 0; i < 3; i++) {
      for (var s = 0; s < player.symbols.length; s++) {
        // La prima posizione di array contiene il simbolo da rimuovere due volte.
        if ((player.symbols[i] == array[0]) && (count1 > 0)) {
          delete player.symbols[i];
          count1--;
          break;
        }
        // La seconda posizione di array contiene il simbolo da rimuovere una volta.
        else if((player.symbols[i] == array[1]) && (count2 > 0)) {
          delete player.symbols[i];
          count2--;
          break;
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
    socket.emit('update', {
      player: infoGiocatori,
      state: states
    });
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

    var nickname = data;
  
    // Se non c'è già un giocatore con il nick inserito.
    if(!Player.find(nickname)) {
      // Creo una variabile player e aumento il numero dei giocatori.
      var player = Player(playerNumber,colors[playerNumber],nickname, socketID);
      playerNumber++;

      // Dico al client che è stato accettato.
      socket.emit('playerAccepted');

      // Se ci sono due giocatori assegno gli stati e pongo started a true.
      if (playerNumber == 2) {
        Player.assignStatePlayers();
        started = true;

        // Mi riposo per 3 secondi così do il tempo all'ultimo client di caricare la pagina.
        setTimeout(null, 3000);

        // Dico ai giocatori che è iniziato la partita e passo il nickname del giocatore che deve iniziare.
        socket.emit("started", Player.find(0).nickname);
        
        // Cambio lo stato del primo giocatore in ASSIGN. e tutti gli altri in WAITER.
        Player.changeTurn(false, playerState.ASSIGN, player);
        update();
      }

      // Invio il nick del giocatore così ogni client sa chi è lui nella lista player.
      socket.emit("playerInfo", nickname);
    }

    // Altrimenti dico che il nick è già preso.
    else
      socket.emit('error', 'nickNotAvailable');
  });

  // Viene richiamata quando un client vuole scambiare le sue carte simbolo.
  socket.on('exchangeSymbol', function(data) {
    var combination = data.combination;
    var array = data.array;

    // Se la combinazione è corretta e il giocatore ne è in possesso.
    if ((symbols.includes(combination)) && Player.countSymbol(combination, player, array)) {
      // Aggiungo le truppe al giocatore e rimuovo i simboli.
      player.troops = player.troops + symbols[combination];
      Player.removeSymbol(combination, player, array);
      var update = Player.update();

      // In questo caso aggiorno soltanto l'utente corrente.
      socket.emit('update', update);
    }

    else {
      socket.emit('error', 'noSymbol');
    }

  });

  // Viene richiamata quando un client vuole aggiungere truppe al suo territorio.
  socket.on ('addTroops', function(data) {
    var player = Player.found(data.player);
    //var troop = data.troop;
    var state = data.state;

    var state1 = states.find(item=>item.name==state);

    // Se il player che mi ha mandato la richiesta è l'effettivo possessore dello stato e il suo stato è ASSIGN.
    if (player.nickname == state.owner && player.computationState == playerState.ASSIGN) {
      // Aggiungo il carro armato.
      state1.troops++;
      player.troops--;
      socket.emit("troopAdded");

      // Se ho finito di assegnare le truppe passo allo stato ATTACK.
      if (player.troops == 0) {
        Player.changeTurn(false, playerState.ATTACK, player);
      }
      update();
    }

    // Il giocatore non può assegnare truppe. Non è il suo momento.
    else if (player.computationState != playerState.ASSIGN) {
      socket.emit("error", "noTurn");
    }

    // Altrimenti non possiede il territorio.
    else {
      socket.emit("error", "move"); 
    }
  });

  // Se ricevo questo messaggio il giocatore vuole effettuare un attacco.
  socket.on('attackPlayer', function(data) {
    var attacker = Player.find(data.attacker);
    var defender = Player.find(data.defender);
    var troops = data.troop;
    var attackerState = data.state1;
    var defenderState = data.state2;

    var state1 = states.find(item=>item.name==attackerState);
    var state2 = states.find(item=>item.name==defenderState);

    // Controllo che lo stato che sta attaccando sia effettivamente dell'attaccante 
    // e che lo stato che sta difendendo sia effettivamente del difensore.
    if ((attacker.nickname == state1.owner) && (defender.nickname == state2.owner) && attacker.computationState == playerState.ATTACK) {
      // Controllo che sia lo stato che attacca che quello che difende abbiano abbastanza truppe.      
      if ((state1.troop > troops) && (state2.troop >= troops)) {
        // Creo e riempio gli array che contengono il lancio dei dadi.
        var attackerDice = [];
        var defenderDice = [];

        // Simulo il lancio dei dadi per le volte necessarie.
        for (var i = 0; i < troops; i++) {
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
        // Controllo chi vince gli scontri.
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
            attacker.symbol.push[symbols[index]];

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

        // Aggiorno le truppe degli stati.
        state1.troop = state1.troop - (troops - clashesWon);
        state2.troop = state2.troop - clashesWon;

        // Aggiorno i client.
        update();
      }

      // Se il numero di truppe non va bene allora avviso l'utente.
      else {
        socket.emit("error", "noTroops");
      }
    }

    // Il giocatore non può spostare truppe. Non è il suo momento.
    else if (player.computationState != playerState.MOVE) {
      socket.emit("error", "noTurn");
    }

    // Altrimenti non possiede almeno uno dei due territori.
    else {
      socket.emit("error", "attack");    
    }
  });

  // Se ricevo questo messaggio vuol dire che il client ha terminato di attaccare.
  socket.on('endAttack' , function(data) {
    // Cambio il suo stato e aggiorno tutti.
    changeTurn(false, playerState.MOVE, player);
    update();
  });

  // Viene richiamata quando un client vuole spostare truppe da un territorio all'altro.
  socket.on('moveTroops', function(data) {
    var player = Player.found(data.player);
    var initialState = data.state1;
    var endState = data.state2;
    var troops = data.troop;

    var state1 = states.find(item=>item.name==initialState);
    var state2 = states.find(item=>item.name==endState);

    // Se il player che mi ha mandato la richiesta è il possessore di entrambi i territori ed è il turno di spostare.
    if ((player.nickname == state1.owner) && (player.nickname == state2.owner) && (player.computationState == playerState.MOVE)) {
      // Se il territorio di partenza ha effettivamente tali truppe e il giocatore lascia almeno un carro armato.
      if (state1.troop > troops) {
        state1.troop = state1.troop - troops;
        state2.troop = state2.troop + troops;
        socket.emit("movedTroops");

        // Se lo spostamento va a buon fine devo iniziare un nuovo turno.
        changeTurn(true, playerState.WAITER, player);
        update();

      }
      // Se non ha abbastanza truppe lo avviso.
      else {
        socket.emit("error", "noTroops");
      }
    }

    // Il giocatore non può spostare truppe. Non è il suo momento.
    else if (player.computationState != playerState.MOVE) {
      socket.emit("error", "noTurn");
    }

    // Altrimenti non possiede almeno uno dei due territori.
    else {
      socket.emit("noOwner", "move");
    }
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
