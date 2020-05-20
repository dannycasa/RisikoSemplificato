// Dipendenze
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
let playerTurn = -1;                              // Indica di quale giocatore è il turno.

// Costruttore Giocatori.
var Player = function (number, color, nick, id) {
  var self  = {
    id: id,                               // Questo è l'id della socket del giocatore,
    number: number,                       // Questo è il numero del giocatore (0, 1, 2, 3),
    color: color,                         // Questo è il colore assegnato al giocatore,
    states: [],                           // Questo è l'array degli stati che ha il giocatore attualmente,
    symbols: [],                          // Questo è l'array di simboli che il giocatore ha pescato,
    bonus: 0,                             // Questo è l'eventuale bonus dovuto alla conquista di un intero continente,
    stateNumber: 0,                       // Questo è il numero degli stati (utilizzato quando si fa l'assegnamento iniziale degli stati),
    nickname: nick,                       // Questo è il nickname del giocatore,
    computationState: playerState.IDLE,   // Questo è lo stato interno del giocatore, inizialmente IDLE e deve attendere l'ok del server,
    troop: 0                              // Questo rappresenta le truppe che il server assegna ad inizio turno al client, considerando anche i bonus.
  }

  Player.list[number] = self;
  return self;
}

Player.list = {};

// Funzione che viene chiamata quando un giocatore si disconnette per rimuoverlo dalla lista dei giocatori.
Player.onDisconnect = function (sockID) {
  delete Player.list[sockID];
}

// Funzione che raccoglie tutte le informazioni dei giocatori in un array (viene utilizzata poi dalla funzione update()).
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

    // Se siamo 4 giocatori e il giocatore è uno dei 'fortunati' avrà uno stato in più.
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
        // Altrimenti cerco un altro stato.
        else {
          s = Math.floor(Math.random() * states.length);
        }
      }
    }
  }
}

// Funzione per cambiare il turno, changed indica se devo cambiare turno, playerState indica lo stato in cui devo muovere il player.
Player.changeTurn = function(changed, pState, player) {
  // Modifico il turno, utilizzando la funzione modulo.
  if (changed) {
    playerTurn = (playerTurn + 1) % playerNumber;
  }

  for (var i in Player.list) {
    var p = Player.list[i];

    // Se è cambiato il turno e sono il giocatore designato allora il mio stato diventa ASSIGN.
    if ((changed) && (p.number == playerTurn)) {
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
    if ((array[0] == symbols.Cannone) && (array[1] == symbols.Fante)) {
      if ((countCannoni >=2) && (countFanti != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due cannoni e un cavaliere.
    else if ((array[0] == symbols.Cannone) && (array[1] == symbols.Cavaliere)) {
      if ((countCannoni >=2) && (countCavalieri != 0)) {
        return true;
      }
    }

    // Se voglio la combinazione due fanti e un cannone.
    else if ((array[0] == symbols.Fante) && (array[1] == symbols.Cannone)) {
      if ((countFanti >=2) && (countCannoni != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due fanti e un cavaliere.
    else if ((array[0] == symbols.Fante) && (array[1] == symbols.Cavaliere)) {
      if ((countFanti >=2) && (countCavalieri != 0)) {
        return true;
      }
    }

    // Se voglio la combinazione due cavalieri e un cannone.
    else if ((array[0] == symbols.Cavaliere) && (array[1] == symbols.Cannone)) {
      if ((countCavalieri >=2) && (countCannoni != 0)) {
        return true;
      }
    }
    // Se voglio la combinazione due cavaliere e un fante.
    else if ((array[0] == symbols.Cavaliere) && (array[1] == symbols.Fante)) {
      if ((countCavalieri >=2) && (countFanti != 0)) {
        return true;
      }
    }
  }

  // Se non viene soddisfatta la quantità richiesta restituisco false.
  return false;
}

// Funzione per rimuovere i simboli, evito molti controlli perchè dalla precedente funzione sono sicuro che il giocatore ne è in possesso.
Player.removeSymbol = function(symbol, player, array) {
  // Se devo rimuovere un tris di simboli.
  if ((symbol == symbols.Cannone) || (symbol == symbols.Fante) || (symbol == symbols.Cavaliere)) {
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

// Funzione per calcolare il bonus del player del player dato.
Player.countBonus = function(player) {
  var countAmericaSettentrionale = 0;
  var countAmericaMeridionale = 0;
  var countEuropa = 0;
  var countAfrica = 0;
  var countAsia = 0;
  var countOceania = 0;

  var totalBonus = 0;

  // Conto quanti stati per ogni continente ha il giocatore.
  for (var i in player.states) {
    var continent = player.states[i].continent;
  
    if (continent == continents.find(item=>item.name=='America Settentrionale'))
      countAmericaSettentrionale++;

    else if (continent == continents.find(item=>item.name=='America Meridionale'))
      countAmericaMeridionale++;

    else if (continent == continents.find(item=>item.name=='Europa'))
      countEuropa++;

    else if (continent == continents.find(item=>item.name=='Africa'))
      countAfrica++;

    else if (continent == continents.find(item=>item.name=='Asia'))
      countAsia++;

    else if (continent == continents.find(item=>item.name=='Oceania'))
      countOceania++;
  }

  if (countAmericaSettentrionale == continents.find(item=>item.name=='America Settentrionale'))
    totalBonus += continents.find(item=>item.name=='America Settentrionale').bonus;

  else if (countAmericaMeridionale == continents.find(item=>item.name=='America Meridionale'))
    totalBonus += continents.find(item=>item.name=='America Meridionale').bonus;

  else if (countEuropa == continents.find(item=>item.name=='Europa'))
    totalBonus += continents.find(item=>item.name=='Europa').bonus;

  else if (countAfrica == continents.find(item=>item.name=='Africa'))
    totalBonus += continents.find(item=>item.name=='Africa').bonus;

  else if (countAsia == continents.find(item=>item.name=='Asia'))
    totalBonus += continents.find(item=>item.name=='Asia').bonus;

  else if (countOceania == continents.find(item=>item.name=='Oceania'))
    totalBonus += continents.find(item=>item.name=='Oceania').bonus;
  
  // Assegno il bonus al giocatore.
  player.bonus = totalBonus;
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

// Gestione della comunicazione sulla socket.
io.on('connection', function(socket) {
  // Ad ogni connessione, do un id alla socket e la aggiungo alla lista delle socket.
  socket.id = Math.random();
  let socketID = socket.id;
  SOCKET_LIST[socket.id] = socket;
  
  console.log('New Connection ' + socketID);
  
  // Viene richiamata quando client, cioè un giocatore si registra alla partita.
  socket.on('newPlayer', function(data) {
    // Se ci sono già 2/4 giocatori o la partita è iniziata.
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

      // Se ci sono due giocatori assegno gli stati, l'eventuale bonus e pongo started a true.
      if (playerNumber == 2) {
        Player.assignStatePlayers();
        for (var i in Player.list) {
          Player.countBonus(Player.list[i]);
        }
        started = true;
////////////////////////////////////////////////////////////////////    forse non c'è bisogno    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        // Dico ai giocatori che è iniziata la partita e passo il nickname del giocatore che deve iniziare.
        socket.emit("started", Player.find(0).nickname);
        
        // Cambio lo stato del primo giocatore in ASSIGN. e tutti gli altri in WAITER.
        Player.changeTurn(true, playerState.ASSIGN, player);
        update();
      }

///////////////////////////////////////////////////////////     anche questa potrebbe essere superflua \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
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
      player.troops += symbols[combination];
      Player.removeSymbol(combination, player, array);
      var update = Player.update();

      // In questo caso aggiorno soltanto l'utente corrente.
      socket.emit('update', update);
    }

    // Altrimenti dico che non si hanno i simboli richiesti.
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
    if ((player.nickname == state.owner) && (player.computationState == playerState.ASSIGN)) {
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

    // Il giocatore non può assegnare le truppe. Non è il suo momento.
    else if ((player.nickname == state.owner) && (player.computationState != playerState.ASSIGN)) {
      socket.emit("error", "noTurn");
    }

    // Altrimenti non possiede il territorio.
    else {
      socket.emit("error", "move"); 
    }
  });

  // Viene richiamata quando un giocatore vuole effettuare un attacco.
  socket.on('attackPlayer', function(data) {
    var attacker = Player.find(data.attacker);
    var defender = Player.find(data.defender);
    var troops = data.troop;
    var attackerState = states.find(item=>item.name==data.state1);
    var defenderState = states.find(item=>item.name==data.state2);

    // Controllo che lo stato che sta attaccando sia effettivamente dell'attaccante, che lo stato che sta difendendo sia effettivamente 
    // del difensore e che l'attaccante possa effettivamente attaccare.
    if ((attacker.nickname == attackerState.owner) && (defender.nickname == defenderState.owner) && (attacker.computationState == playerState.ATTACK)) {
      // Controllo che sia lo stato che attacca che quello che difende abbiano abbastanza truppe. 
      // Allo stato attaccante deve rimanere almeno un carro armato nel territorio, lo stato difensore invece può schierare tutte le truppe.     
      if ((attackerState.troop > troops) && (defenderState.troop >= troops)) { 
        // Creo e riempio gli array che contengono il lancio dei dadi.
        var attackerDice = [];
        var defenderDice = [];

        // Simulo il lancio dei dadi per le volte necessarie.
        for (var i = 0; i < troops; i++) {
          attackerDice[i] = Math.round(Math.random() * 6) + 1;
          defenderDice[i] = Math.round(Math.random() * 6) + 1;
        }

        // Ordino gli array in ordine decrescente.
        attackerDice.sort(function(a, b) {
          return b - a;
        });
        defenderDice.sort(function(a, b) {
          return b - a;
        });

        // Conto gli scontri vinti dall'attaccante
        var clashesWon = 0;
        // Controllo chi vince gli scontri.
        for (var i = 0; i < troop; i++) {
          // Il numero deve essere strettamente maggiore, altrimenti vince la difesa.
          if (attackerDice[i] > defenderDice[i])
            clashesWon++;
        }

        // Se l'attaccante vince tutti gli scontri e lo stato difensore rimane senza truppe.
        if ((clashesWon == troop) && (defenderState.troop == troop)) {
          // Cambio il possessore dello stato, aggiungo tale stato alla lista degli stati dell'attaccante e azzero le truppe presenti.
          defenderState.owner = attacker.nickname;
          attacker.states.push(defenderState);
          defenderState.troops = 0;
          attacker.stateNumber++;

          // Tolgo lo stato dalla lista degli stati del giocatore che difendeva.
          delete defender.states[defenderState];
          defender.stateNumber--;

          // Verifico se devo modificare i bonus dei giocatori.
          Player.countBonus(attacker);
          Player.countBonus(defender);

          // Pesco una carta simbolo.
          var index = Math.round(Math.random() * 5);
          var j = 0;
          for (var i in symbols) {
            symbol = symbols[i];
            if (j == index) {
              // e la aggiungo a quelle del giocatore.
              attacker.symbols.push[symbol];
            }
            else
              j++;
          }
        
          // Avviso l'attaccante che ha conquistato lo stato.
          socket.emit("stateWon", {
            name: defenderState.name,
            symbol: symbols[index]
          });

          // Avviso il difensore che ha perso lo stato.
          var sock = defender.id;
          SOCKET_LIST[sock].emit("stateLost", {
            name: defenderState,
            player: attacker
          })
        }

        // Altrimenti l'attacco è fallito.
        else {
          // In questo caso lo stato resta al possessore.
          socket.emit("stateNotWon", {
            player: defender.nickname,
            battleWon: clashesWon,
            totalBattle: troop,
            name: defenderState.name
          });

          var sock = defender.id;
          SOCKET_LIST[sock].emit("stateNotWon", {
            player: defender.nickname,
            battleWon: clashesWon,
            totalBattle: troop,
            name: defenderState.name
          });
        }

        // Aggiorno le truppe degli stati.
        attackerState.troop = attackerState.troop - (troops - clashesWon);
        defenderState.troop = defenderState.troop - clashesWon;

        // Aggiorno i client.
        update();
      }

      // Se il numero di truppe non va bene allora avviso l'utente.
      else {
        socket.emit("error", "noTroops");
      }
    }

    // Il giocatore non può attaccare. Non è il suo momento.
    else if ((attacker.nickname == attackerState.owner) && (defender.nickname == defenderState.owner) && (player.computationState != playerState.ATTACK)) {
      socket.emit("error", "noTurn");
    }

    // Altrimenti non possiede il suo territorio.
    else {
      socket.emit("error", "attack");    
    }
  });

  // Se ricevo questo messaggio vuol dire che il client ha terminato di attaccare.
  socket.on('endAttack' , function() {
    // Cambio il suo stato e aggiorno tutti.
    if (player.computationState == playerState.ATTACK) {
      changeTurn(false, playerState.MOVE, player);
      update();
    }

    // Non è il turno del giocatore.
    else {
      socket.emit("error", "noTurn");
    }
  });

  // Viene richiamata quando un client vuole spostare truppe da un territorio all'altro.
  socket.on('moveTroops', function(data) {
    var player = Player.found(data.player);
    var initialState = states.find(item=>item.name==data.state1);
    var endState = states.find(item=>item.name==data.state2);
    var troops = data.troop;
    var stateWon = data.won;

    // Se il player che mi ha mandato la richiesta è il possessore di entrambi i territori ed è il turno di spostare.
    // Oppure il player è il possessore dei territori ed ha appena conquistato un territorio.
    if (((player.nickname == initialState.owner) && (player.nickname == endState.owner)) && ((player.computationState == playerState.MOVE) || (stateWon))) {
      // Se il territorio di partenza ha effettivamente tali truppe e il giocatore lascia almeno un carro armato.
      if (state1.troop > troops) {
        state1.troop = state1.troop - troops;
        state2.troop = state2.troop + troops;
        socket.emit("movedTroops");

        if (!stateWon) {
          // Se lo spostamento va a buon fine devo iniziare un nuovo turno.
          changeTurn(true, playerState.WAITER, player);
        }
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
