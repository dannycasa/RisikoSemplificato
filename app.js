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
let bonusFirstTurn = stateModule.firstTroopAssignmentList; // Lista del bonus di carri armati dati al primo turno.
let playerTurn = -1;                              // Indica di quale giocatore è il turno.
let firstTurn = true;                              // Indica se è il primo turno o no.
let temporary = [];
var timerDisconnect;

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
    troop: 0,                             // Questo rappresenta le truppe che il server assegna ad inizio turno al client, considerando anche i bonus.
    isConnect: false                      // Questo valore indica se il giocatore è ancora connesso o no.
  }

  Player.list[number] = self;
  return self;
}

Player.list = {};

// Funzione che viene chiamata quando un giocatore si disconnette per rimuoverlo dalla lista dei giocatori.
Player.onDisconnect = function (sockID) {
  for (var p in Player.list)
    if (Player.list[p].id == sockID)
      delete Player.list[p];
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
      troop: player.troop,
      isConnect: player.isConnect
    });
  }
  return infoGiocatori;
}

// Funzione che restituisce il giocatore data un criterio.
Player.find = function(search, type) {
  for (var i in Player.list) {
    var player = Player.list[i];
    // Posso cercare il giocatore per il numero.
    if (type == "number") {
      if (player.number == search)
        return player;
    }
    // Posso cercare il giocatore per il nickname.
    else if (type == "nickname") {
      if (player.nickname == search)
        return player;
    }
    // Posso cercare il giocatore per id della socket.
    else if (type == "socket") {
      if (player.id == search)
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
    var player = Player.find(num, "number");

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
          states[s].troops = 1;
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
    if(playerTurn + 1 == playerNumber) {
      firstTurn = false;
    }
    playerTurn = (playerTurn + 1) % (playerNumber);
  }

  for (var i in Player.list) {
    var p = Player.list[i];

    // Se è cambiato il turno e sono il giocatore designato allora il mio stato diventa ASSIGN.
    if ((changed) && (p.number == playerTurn)) {
      p.computationState = playerState.ASSIGN;
      // Do le truppe che gli spettano al mio giocatore.
      p.troop = Math.floor(p.states.length / 3) + p.bonus;
      if (firstTurn)
        p.troop += bonusFirstTurn[playerNumber] - p.stateNumber;
    }

    // Se non è cambiato il turno e sono il giocatore indicato allora il mio stato diventa quello passato come argomento.
    else if ((!changed) && (p.nickname == player.nickname))  {
      p.computationState = pState;
    }

    // In ogni altro caso pongo/mantengo il mio stato in WAITER.
    else {
      p.computationState = playerState.WAITER;
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
      for (var s in player.symbols) {
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
      for (var s in player.symbols) {
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
      for (var s in player.symbols) {
        // La prima posizione di array contiene il simbolo da rimuovere due volte.
        if ((player.symbols[s] == array[0]) && (count1 > 0)) {
          delete player.symbols[s];
          count1--;
          break;
        }
        // La seconda posizione di array contiene il simbolo da rimuovere una volta.
        else if((player.symbols[s] == array[1]) && (count2 > 0)) {
          delete player.symbols[s];
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
  
    if (continent == continents.find(item=>item.name=='America Settentrionale').name)
      countAmericaSettentrionale++;

    else if (continent == continents.find(item=>item.name=='America Meridionale').name)
      countAmericaMeridionale++;

    else if (continent == continents.find(item=>item.name=='Europa').name)
      countEuropa++;

    else if (continent == continents.find(item=>item.name=='Africa').name)
      countAfrica++;

    else if (continent == continents.find(item=>item.name=='Asia').name)
      countAsia++;

    else if (continent == continents.find(item=>item.name=='Oceania').name)
      countOceania++;
  }

  if (countAmericaSettentrionale == continents.find(item=>item.name=='America Settentrionale').states)
    totalBonus += continents.find(item=>item.name=='America Settentrionale').bonus;

  else if (countAmericaMeridionale == continents.find(item=>item.name=='America Meridionale').states)
    totalBonus += continents.find(item=>item.name=='America Meridionale').bonus;

  else if (countEuropa == continents.find(item=>item.name=='Europa').states)
    totalBonus += continents.find(item=>item.name=='Europa').bonus;

  else if (countAfrica == continents.find(item=>item.name=='Africa').states)
    totalBonus += continents.find(item=>item.name=='Africa').bonus;

  else if (countAsia == continents.find(item=>item.name=='Asia').states)
    totalBonus += continents.find(item=>item.name=='Asia').bonus;

  else if (countOceania == continents.find(item=>item.name=='Oceania').states)
    totalBonus += continents.find(item=>item.name=='Oceania').bonus;
  
  // Assegno il bonus al giocatore.
  player.bonus = totalBonus;
}

// Questa è la funzione che invia i nuovi valori dei giocatori ai client in modo che sia tutto sincronizzato.
function update() {
  var infoGiocatori = Player.update();
  for(var j in SOCKET_LIST) {
      var socket = SOCKET_LIST[j];
      socket.emit('update', {
        player: infoGiocatori,
        state: states,
        first: firstTurn
      });    
  }
}

// Questa è la funzione (chiamata dopo 5 secondi dall'invocazione) che fa iniziare la partita.
var control = function() {
  var timer = setInterval ( function() {
    // Se ci sono due giocatori assegno gli stati, l'eventuale bonus e pongo started a true.
    if (!started && playerNumber == 2) {
      temporary = [];

      Player.assignStatePlayers();
      for (var i in Player.list) {
        Player.countBonus(Player.list[i]);
      }
      started = true;
      
      // Cambio lo stato del primo giocatore in ASSIGN. e tutti gli altri in WAITER.
      Player.changeTurn(true, playerState.ASSIGN, null);
      update();
      clearInterval(timer);
    }
  }, 5000)  
}

// Questa è la funzione (chiamata dopo 5 secondi dall'invocazione) che fa terminare la partita.
var onDisconnect = function() {
  // Se entro 5 secondi dall'invocazione di onDisconnect, il giocatore non si riconnette viene eseguita la funzione.
  timerDisconnect = setInterval ( function() {
    // La partita è iniziata informo gli altri che un giocatore è andato offline. La partita viene interrotta.
    started = false;     
    playerTurn = -1;
    firstTurn = true;

    for (var p in Player.list) {
      for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        if ((socket.id == Player.list[p].id) && (playerNumber == 2) && (Player.list.length ))
          socket.emit("victory", "left");
        else if (socket.id == Player.list[p].id)
          socket.emit("endOffline");
      }
    }

    // Azzero un pò di variabili.
    for (var s in states) {
      states[s].owner = null;
    }

    playerNumber = 0;
    Player.list = {};
    control();

    clearInterval(timerDisconnect);
  
  }, 5000);

  // Se sono qui il timer potrebbe essere stato interrotto da un giocatore che si è riconnesso, quindi invio un aggiornamento.
  once = setInterval(() => {
    update();
    clearInterval(once);
  }, 2000);
}

control();

// Gestione della comunicazione sulla socket.
io.on('connection', function(socket) {
  // Ad ogni connessione, do un id alla socket e la aggiungo alla lista delle socket.
  socket.id = Math.random();
  let socketID = socket.id;
  SOCKET_LIST[socket.id] = socket;
  
  console.log('New Connection ' + socketID + "\n");

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
    if(!Player.find(nickname, "nickname")) {
      // Creo una variabile player e aumento il numero dei giocatori.
      Player(playerNumber,colors[playerNumber],nickname, socketID);
      playerNumber++;

      // Dico al client che è stato accettato.
      socket.emit('playerAccepted', nickname);
    }

    // Altrimenti dico che il nick è già preso.
    else{
      socket.emit('nickNotAvailable');
    }
  });

  // Viene richiamata quando un client cambia pagina e quindi socket.
  socket.on('newSocket', function(data) {
    var found = 0;
    // Inserisco nel player l'id della socket.
    for (var i in Player.list) {
      if (Player.list[i].nickname == data) {
        Player.list[i].id = socketID;
        temporary.push({id:socketID,nickname:data});
        // Se era disconnesso lo riconnetto e termino il timer per la disconnessione (se era già fermo viene ignorato).
        if (Player.list[i].isConnect == false) {
          Player.list[i].isConnect = true;
          clearInterval(timerDisconnect);
        }
        found = 1;
        break;
      }
    }  

    if(found == 0) {
      Player(playerNumber,colors[playerNumber],data, socketID);
    }
  });

  // Viene richiamata quando un client vuole scambiare le sue carte simbolo.
  socket.on('exchangeSymbol', function(data) {
    var combination = data.combination;
    var array = data.array;
    var player = Player.find(data.player, "nickname");
    var symbol;

    for (var i in symbols) {
      if (symbols[i] == combination)
        symbol = i;
    }

    // Se la combinazione è corretta e il giocatore ne è in possesso.
    if ((symbol != null) && Player.countSymbol(combination, player, array)) {
      // Aggiungo le truppe al giocatore e rimuovo i simboli.
      player.troop += combination;
      Player.removeSymbol(combination, player, array);
      update();
    }

    // Altrimenti dico che non si hanno i simboli richiesti.
    else {
      socket.emit("problem", 'noSymbol');
    }

  });

  // Viene richiamata quando un client vuole aggiungere truppe al suo territorio.
  socket.on ('addTroop', function(data) {
    var player = Player.find(data.player, "nickname");
    var state1 = states.find(item=>item.name==data.state);

    // Se il player che mi ha mandato la richiesta è l'effettivo possessore dello stato e il suo stato è ASSIGN.
    if ((player.nickname == state1.owner) && (player.computationState == playerState.ASSIGN)) {
      // Aggiungo il carro armato.
      state1.troops++;
      player.troop--;

      // Se ho finito di assegnare le truppe passo allo stato ATTACK.
      if (player.troop == 0) {
        if (firstTurn)
          Player.changeTurn(true, playerState.WAITER, player);

        else
          Player.changeTurn(false, playerState.ATTACK, player);
      }

      update();
    }

    // Il giocatore non può assegnare le truppe. Non è il suo momento.
    else if ((player.nickname == state.owner) && (player.computationState != playerState.ASSIGN)) {
      socket.emit("problem", "noTurn");
    }

    // Altrimenti non possiede il territorio.
    else {
      socket.emit("problem", "move"); 
    }
  });

  // Viene richiamata quando un giocatore vuole effettuare un attacco.
  socket.on('attackPlayer', function(data) {
    var attacker = Player.find(data.attacker, "nickname");
    var defender = Player.find(data.defender, "nickname");
    var troops = data.troop;
    var attackerState = states.find(item=>item.name==data.state1);
    var defenderState = states.find(item=>item.name==data.state2);

    // Controllo che lo stato che sta attaccando sia effettivamente dell'attaccante, che lo stato che sta difendendo sia effettivamente 
    // del difensore e che l'attaccante possa effettivamente attaccare.
    if ((attacker.nickname == attackerState.owner) && (defender.nickname == defenderState.owner) && (attacker.computationState == playerState.ATTACK)) {
      // Devo anche controllare che i due stati siano confinanti.
      if(attackerState.neighbor.includes(defenderState.name)) {
        // Controllo che sia lo stato che attacca che quello che difende abbiano abbastanza truppe. 
        // Allo stato attaccante deve rimanere almeno un carro armato nel territorio, lo stato difensore invece può schierare tutte le truppe.     
        if ((attackerState.troops > troops) && (defenderState.troops >= troops)) { 
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
          for (var i = 0; i < troops; i++) {
            // Il numero deve essere strettamente maggiore, altrimenti vince la difesa.
            if (attackerDice[i] > defenderDice[i])
              clashesWon++;
          }

          // Se l'attaccante vince tutti gli scontri e lo stato difensore rimane senza truppe.
          if ((clashesWon == troops) && (defenderState.troops == troops)) {
            // Cambio il possessore dello stato, aggiungo tale stato alla lista degli stati dell'attaccante e azzero le truppe presenti.
            defenderState.owner = attacker.nickname;
            attacker.states.push(defenderState);
            defenderState.troops = 0;

            // Tolgo lo stato dalla lista degli stati del giocatore che difendeva.
            defender.states = defender.states.filter(function(value, index, arr){ return value.name != defenderState.name;});

            // Verifico se devo modificare i bonus dei giocatori.
            Player.countBonus(attacker);
            Player.countBonus(defender);

            // Pesco una carta simbolo.
            var index = Math.floor(Math.random() * 3);
            var arraySymbols = ['Cannone', 'Fante', 'Cavaliere'];
            var symbol = arraySymbols[index];

            attacker.symbols.push(symbols[symbol]);
          
            // Avviso l'attaccante che ha conquistato lo stato.
            socket.emit("stateWon", {
              name: defenderState.name,
              symbol: symbol,
              value: attackerState.troops,
              start: attackerState.name,
              victort: true
            });

            // Avviso il difensore che ha perso lo stato.
            var sock = defender.id;
            SOCKET_LIST[sock].emit("stateLost", {
              name: defenderState.name,
              player: attacker.nickname
            });

            // Controllo condizione di vittoria.
            if(attacker.states.length == attacker.stateNumber + 5) {
              // Avviso tutti che c'è un vincitore e la partita è finita.
              for (var s in SOCKET_LIST)
                SOCKET_LIST[s].emit("victory" , attacker.nickname);
              
              started = false;     
              playerTurn = -1;
              firstTurn = true;
        
              // Azzero un pò di variabili.
              for (var s in states) {
                states[s].owner = null;
              }
        
              playerNumber = 0;
              Player.list = {};
              control();    
            }
          }

          // Altrimenti l'attacco è fallito.
          else {
            // In questo caso lo stato resta al possessore.
            socket.emit("stateNotWon", {
              player: defender.nickname,
              battleWon: clashesWon,
              totalBattle: troops,
              name: defenderState.name
            });

            var sock = defender.id;
            SOCKET_LIST[sock].emit("stateNotWon", {
              player: defender.nickname,
              battleWon: clashesWon,
              totalBattle: troops,
              name: defenderState.name
            });

            // Aggiorno le truppe degli stati.
            attackerState.troops = attackerState.troops - (troops - clashesWon);
            defenderState.troops = defenderState.troops - clashesWon;
          }

          // Aggiorno i client.
          update();
        }
        
        // Se il numero di truppe non va bene allora avviso l'utente.
        else {
          socket.emit("problem", "noTroops");
        }
      }

      // Se i due stati non sono confinanti avviso l'utente..
      else {
        socket.emit("problem", "noNeighbor");
      }
    }

    // Il giocatore non può attaccare. Non è il suo momento.
    else if ((attacker.nickname == attackerState.owner) && (defender.nickname == defenderState.owner) && (player.computationState != playerState.ATTACK)) {
      socket.emit("problem", "noTurn");
    }

    // Altrimenti non possiede il suo territorio.
    else {
      socket.emit("problem", "attack");    
    }
  });

  // Se ricevo questo messaggio vuol dire che il client ha terminato di attaccare.
  socket.on('endAttack' , function(data) {
    var player = Player.find(data, "nickname");
    // Cambio il suo stato e aggiorno tutti.
    if (player.computationState == playerState.ATTACK) {
      Player.changeTurn(false, playerState.MOVE, player);
      update();
    }

    // Non è il turno del giocatore.
    else {
      socket.emit("problem", "noTurn");
    }
  });

  // Viene richiamata quando un client vuole spostare truppe da un territorio all'altro.
  socket.on('moveTroops', function(data) {
    var player = Player.find(data.player, "nickname");
    var initialState = states.find(item=>item.name==data.state1);
    var endState = states.find(item=>item.name==data.state2);
    var troops = data.troop;
    var stateWon = data.won;
      
    // Se il player che mi ha mandato la richiesta è il possessore di entrambi i territori ed è il turno di spostare.
    // Oppure il player è il possessore dei territori ed ha appena conquistato un territorio.
    if (((player.nickname == initialState.owner) && (player.nickname == endState.owner)) && ((player.computationState == playerState.MOVE) || (stateWon))) {
      // Devo anche controllare che i due stati siano confinanti.
      if(initialState.neighbor.includes(endState.name)) {
        // Se il territorio di partenza ha effettivamente tali truppe e il giocatore lascia almeno un carro armato.
        if (initialState.troops > troops) {
          initialState.troops = initialState.troops - troops;
          endState.troops = endState.troops + troops;

          if (!stateWon) {
            // Se lo spostamento va a buon fine devo iniziare un nuovo turno.
            Player.changeTurn(true, playerState.WAITER, player);
          }

          update();

        }

        // Se non ha abbastanza truppe lo avviso.
        else {
          socket.emit("problem", "noTroops");
        }
      }

      // Se i due stati non sono confinanti avviso l'utente.
      else {
        socket.emit("problem", "noNeighbor");
      }
    }

    // Il giocatore non può spostare truppe. Non è il suo momento.
    else if (player.computationState != playerState.MOVE) {
      socket.emit("problem", "noTurn");
    }

    // Altrimenti non possiede almeno uno dei due territori.
    else {
      socket.emit("problem", "move");
    }
  });

   // Se ricevo questo messaggio vuol dire che il client ha saltato lo spostamento.
   socket.on('endMove' , function(data) {
    var player = Player.find(data, "nickname");
    // Cambio il suo stato e aggiorno tutti.
    if (player.computationState == playerState.MOVE) {
      Player.changeTurn(true, playerState.WAITER, player);
      update();
    }

    // Non è il turno del giocatore.
    else {
      socket.emit("error", "noTurn");
    }
  });

  // Viene richiamata quando un client si disconnette.
  socket.on('disconnect', function() {    
    // Rimuovo il client dalla lista di socket.
    delete SOCKET_LIST[socketID];

    // Chiamo questa funzione che dà 5 secondi al client per riconnettersi.
    if (started) {
      var player = Player.find(socketID, "socket");
      if(player) {
        player.isConnect = false;
        onDisconnect(socketID);
      }
    }

    else {
      // Se la partita non è iniziata rimuovo il giocatore dalla coda.
      var found = [];
      if (temporary != null) 
        found = temporary.filter(function(value, index, arr){ return value.id == socketID;});

      if (found.length > 0) {

        Player.onDisconnect(socketID);
        playerNumber--;
;
      }
    }
  });

  // Viene richiamata quando un client invia un messaggio in chat.
  socket.on('sendMsgToServer', function(data) {
    var playerName;
    for (var i in Player.list) {
      if (Player.list[i].id == socketID) {
        playerName = Player.list[i].nickname;
        break;
      }
    }
    
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

/*
setInterval ( function() {
  console.log("Player list:");
  for (var p in Player.list) {
    console.log(Player.list[p].nickname + " " + Player.list[p].id + " " + Player.list[p].isConnect);
  }
  console.log("Socket list:");
  for(var s in SOCKET_LIST){
    console.log(SOCKET_LIST[s].id);
  }
  console.log("\n ngiocatori " + playerNumber + " turno " + playerTurn + " started " + started);
}, 10000) 
*/ 
