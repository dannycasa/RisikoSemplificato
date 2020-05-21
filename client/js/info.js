const states = [
  {
    name: 'Groenlandia',
    continent: 'America Settentrionale',
    x: 482,
    y: 85,
    radius: 20,
    neighbor: [
      'Quebec',
      'Islanda',
      'Territori del Nord Ovest',
      'Ontario'
    ]
  },

  {
    name: 'Alaska',
    continent: 'America Settentrionale',
    x: 141,
    y: 127,
    radius: 20,
    neighbor: [
      'Territori del Nord Ovest',
      'Alberta',
      'Kamchatka'
    ]
  },

  {
    name: 'Territori del Nord Ovest',
    continent: 'America Settentrionale',
    x: 219,
    y: 151,
    radius: 20,
    neighbor: [
      'Groenlandia',
      'Alaska',
      'Alberta',
      'Ontario'
    ]
  },

  {
    name: 'Alberta',
    continent: 'America Settentrionale',
    x: 175,
    y: 210,
    radius: 20,
    neighbor: [
      'Alaska',
      'Territori del Nord Ovest',
      'Ontario',
      'Stati Uniti Occidentali'
    ]
  },

  {
    name: 'Ontario',      
    continent: 'America Settentrionale',
    x: 274,
    y: 256,
    radius: 20,
    neighbor: [
      'Alberta',
      'Territori del Nord Ovest',
      'Groenlandia',
      'Quebec',
      'Stati Uniti Orientali',
      'Stati Uniti Occidentali'
    ]
  },

  {
    name: 'Quebec',    
    continent: 'America Settentrionale',
    x: 365,
    y: 269,
    radius: 20,
    neighbor: [
      'Ontario',
      'Groenlandia',
      'Stati Uniti Orientali'
    ]
  },

  {
    name: 'Stati Uniti Orientali',       
    continent: 'America Settentrionale',
    x: 228,
    y: 329,
    radius: 20,
    neighbor: [
      'Stati Uniti Occidentali',
      'Ontario',
      'Quebec',
      'America Centrale'
    ]
  },

  {
    name: 'Stati Uniti Occidentali',
    continent: 'America Settentrionale',
    x: 145,
    y: 276,
    radius: 20,
    neighbor: [
      'Alberta',
      'Ontario',
      'Stati Uniti Orientali',
      'America Centrale'
    ]
  },

  {
    name: 'America Centrale',    
    continent: 'America Settentrionale',
    x: 127,
    y: 342,
    radius: 20,
    neighbor: [
      'Stati Uniti Occidentali',
      'Stati Uniti Orientali',
      'Venezuela'
    ]
  },

  {
    name: 'Argentina',
    continent: 'America Meridionale',
    x: 184,
    y: 612,
    radius: 20,
    neighbor: [
      'Perù',
      'Brasile'
    ]
  },

  {
    name: 'Brasile',
    continent: 'America Meridionale',
    x: 267,
    y: 495,
    radius: 20,
    neighbor: [
      'Venezuela',
      'Argentina',
      'Perù',
      'Africa del Nord'
    ]
  },

  {
    name: 'Perù',
    continent: 'America Meridionale',
    x: 185,
    y: 540,
    radius: 20,
    neighbor: [
      'Venezuela',
      'Brasile',
      'Argentina'
    ]
  },

  {
    name: 'Venezuela',
    continent: 'America Meridionale',
    x: 183,
    y: 429,
    radius: 20,
    neighbor: [
      'America Centrale',
      'Brasile',
      'Perù'
    ]
  },

  {
    name: 'Islanda',
    continent: 'Europa',
    x: 559,
    y: 146,
    radius: 20,
    neighbor: [
      'Groenlandia',
      'Gran Bretagna',
      'Scandinavia'
    ]
  },

  {
    name: 'Gran Bretagna',
    continent: 'Europa',
    x: 528,
    y: 262,
    radius: 20,
    neighbor: [
      'Islanda',
      'Scandinavia',
      'Europa Settentrionale',
      'Europa Occidentale'
    ]
  },

  {
    name: 'Europa Occidentale',
    continent: 'Europa',
    x: 490,
    y: 335,
    radius: 20,
    neighbor: [
      'Gran Bretagna',
      'Europa Settentrionale',
      'Europa Meridionale',
      'Africa del Nord'
    ]
  },

  {
    name: 'Scandinavia',
    continent: 'Europa',
    x: 615,
    y: 200,
    radius: 20,
    neighbor: [
      'Islanda',
      'Ucraina',
      'Europa Settentrionale',
      'Gran Bretagna'
    ]
  },

  {
    name: 'Europa Settentrionale',
    continent: 'Europa',
    x: 617,
    y: 285,
    radius: 20,
    neighbor: [
      'Gran Bretagna',
      'Scandinavia',
      'Ucraina',
      'Europa Meridionale',
      'Europa Occidentale'
    ]
  },

  {
    name: 'Europa Meridionale',
    continent: 'Europa',
    x: 624,
    y: 328,
    radius: 20,
    neighbor: [
      'Europa Occidentale',
      'Europa Settentrionale',
      'Ucraina',
      'Medio Oriente',
      'Egitto',
      'Africa del Nord'
    ]
  },

  {
    name: 'Ucraina',
    continent: 'Europa',
    x: 718,
    y: 266,
    radius: 20,
    neighbor: [
      'Scandinavia',
      'Urali',
      'Afghanistan',
      'Medio Oriente',
      'Europa Meridionale',
      'Europa Settentrionale'
    ]
  },

  {
    name: 'Egitto',
    continent: 'Africa',
    x: 658,
    y: 445,
    radius: 20,
    neighbor: [
      'Africa del Nord',
      'Europa Meridionale',
      'Medio Oriente',
      'Africa Orientale'
    ]
  },

  {
    name: 'Congo',
    continent: 'Africa',
    x: 610,
    y: 543,
    radius: 20,
    neighbor: [
      'Africa del Nord',
      'Africa Orientale',
      'Africa del Sud'
    ]
  },

  {
    name: 'Madagascar',
    continent: 'Africa',
    x: 750,
    y: 610,
    radius: 20,
    neighbor: [
      'Africa Orientale',
      'Africa del Sud'
    ]
  },

  {
    name: 'Africa del Nord',
    continent: 'Africa',
    x: 514,
    y: 450,
    radius: 20,
    neighbor: [
      'Brasile',
      'Europa Occidentale',
      'Europa Meridionale',
      'Egitto',
      'Africa Orientale',
      'Congo'
    ]
  },

  {
    name: 'Africa Orientale',
    continent: 'Africa',
    x: 705,
    y: 515,
    radius: 20,
    neighbor: [
      'Africa del Nord',
      'Egitto',
      'Madagascar',
      'Africa del Sud',
      'Congo'
    ]
  },

  {
    name: 'Africa del Sud',
    continent: 'Africa',
    x: 650,
    y: 610,
    radius: 20,
    neighbor: [
      'Congo',
      'Africa Orientale',
      'Madagascar'
    ]
  },

  {
    name: 'Medio Oriente',
    continent: 'Asia',
    x: 805,
    y: 404,
    radius: 20,
    neighbor: [
      'Europa Meridionale',
      'Ucraina',
      'Afghanistan',
      'Cina',
      'India',
      'Egitto'
    ]
  },

  {
    name: 'Urali',
    continent: 'Asia',
    x: 800,
    y: 225,
    radius: 20,
    neighbor: [
      'Ucraina',
      'Siberia',
      'Cina',
      'Afghanistan'
    ]
  },

  {
    name: 'Afghanistan',
    continent: 'Asia',
    x: 820,
    y: 292,
    radius: 20,
    neighbor: [
      'Ucraina',
      'Urali',
      'Cina',
      'Medio Oriente'
    ]
  },

  {
    name: 'India',
    continent: 'Asia',
    x: 932,
    y: 407,
    radius: 20,
    neighbor: [
      'Medio Oriente',
      'Cina',
      'Siam'
    ]
  },

  {
    name: 'Siam',
    continent: 'Asia',
    x: 1036,
    y: 384,
    radius: 20,
    neighbor: [
      'India',
      'Cina',
      'Indonesia'
    ]
  },

  {
    name: 'Cina',
    continent: 'Asia',
    x: 1004,
    y: 309,
    radius: 20,
    neighbor: [
      'Afghanistan',
      'Urali',
      'Siberia',
      'Mongolia',
      'Siam',
      'India',
      'Medio Oriente'
    ]
  },

  {
    name: 'Mongolia',
    continent: 'Asia',
    x: 982,
    y: 234,
    radius: 20,
    neighbor: [
      'Siberia',
      'Čita',
      'Kamchatka',
      'Giappone',
      'Cina'
    ]
  },

  {
    name: 'Jacuzia',
    continent: 'Asia',
    x: 921,
    y: 122,
    radius: 20,
    neighbor: [
      'Siberia',
      'Kamchatka',
      'Čita'
    ]
  },

  {
    name: 'Siberia',
    continent: 'Asia',
    x: 850,
    y: 197,
    radius: 20,
    neighbor: [
      'Urali',
      'Jacuzia',
      'Čita',
      'Mongolia',
      'Cina'
    ]
  },

  {
    name: 'Čita',
    continent: 'Asia',
    x: 928,
    y: 205,
    radius: 20,
    neighbor: [
      'Siberia',
      'Jacuzia',
      'Kamchatka',
      'Mongolia'
    ]
  },

  {
    name: 'Kamchatka',
    continent: 'Asia',
    x: 1000,
    y: 111,
    radius: 20,
    neighbor: [
      'Jacuzia',
      'Alaska',
      'Giappone',
      'Mongolia',
      'Čita'
    ]
  },

  {
    name: 'Giappone',
    continent: 'Asia',
    x: 1136,
    y: 200,
    radius: 20,
    neighbor: [
      'Kamchatka',
      'Mongolia'
    ]
  },

  {
    name: 'Nuova Guinea',
    continent: 'Oceania',
    x: 1196,
    y: 506,
    radius: 20,
    neighbor: [
      'Indonesia',
      'Australia Occidentale',
      'Australia Orientale'
    ]
  },

  {
    name: 'Indonesia',
    continent: 'Oceania',
    x: 1111,
    y: 454,
    radius: 20,
    neighbor: [
      'Siam',
      'Nuova Guinea',
      'Australia Occidentale'
    ]
  },

  {
    name: 'Australia Orientale',
    continent: 'Oceania',
    x: 1165,
    y: 624,
    radius: 20,
    neighbor: [
      'Australia Occidentale',
      'Nuova Guinea'
    ]
  },

  {
    name: 'Australia Occidentale',
    continent: 'Oceania',
    x: 1068,
    y: 588,
    radius: 20,
    neighbor: [
      'Indonesia',
      'Nuova Guinea',
      'Australia Orientale'
    ]
  }
];
  
const continents = [
  {
    name: 'America Settentrionale',
    states: 9,
    bonus: 5
  },

  {
    name: 'America Meridionale',
    states: 4,
    bonus: 2
  },

  {
    name: 'Europa',
    states: 7,
    bonus: 5
  },

  {
    name: 'Africa',
    states: 6,
    bonus: 3
  },

  {
    name: 'Asia',
    states: 12,
    bonus: 7
  },

  {
    name: 'Oceania',
    states: 4,
    bonus: 2
  }
];

const symbols = {
  'Cannone': 4,
  'Fante': 6,
  'Cavaliere': 8,
  'Diversi': 10,
  'Jolly': 12
};

// I colori sono verde, rosso, giallo e blu.
const colors = [
  '#00ff00', 
  '#ff0000', 
  '#ffff00', 
  '#0000ff'
];

/*
 idle è lo stato del giocatore quando viene creato.
 waiter sono i giocatori che attendono poichè non è il loro turno,
 assign è il giocatore che sta assegnando i carri armati ad inizio turno,
 attack è il giocatore che è in fase di attacco,
 move è il giocatore che sta spostando truppe.
 */
const playerState = {
  IDLE: "idle",
  WAITER: 'waiter',
  ASSIGN: 'assign',
  ATTACK: 'attack',
  MOVE: 'move'
}

const suggestions = {
  ASSIGN: 'Puoi assegnare le truppe nei tuoi territori cliccando sullo stato, ad ogni click corrisponde un carro armato assegnato. Puoi anche guardare la sezione "Possibili azioni del giocatore" per verificare se puoi scambiare carte simbolo per avere più carri armati.',
  ATTACK: 'Puoi attaccare gli stati nemici con i tuoi, nota che uno stato per poter essere attaccato deve essere confinante al tuo. Una volta terminata la fase di attacco clicca sul bottone "Termina fase di attacco" nella sezione "Possibili azioni del giocatore". Se conquisti un territorio hai diritto ad uno spostamento dal territorio di attacco a quello conquistato. Ricorda che deve rimanere almeno un carro armato a difendere ogni tuo stato.',
  MOVE: 'Puoi spostare le truppe da un tuo stato ad un altro se tali stati sono confinanti. Puoi effettuare un solo spostamento ogni turno. Lo spostamento non è obbligatorio, infatti si può cliccare sul bottone "Termina fase di spostamento" nella sezione "Possibili azioni del giocatore". Lo spostamento determina la fine del turno.',
  WAITING: 'Non è il tuo turno, un altro giocatore sta effettuando le proprie mosse.',
  IDLE: 'Sei correttamente registrato nel sistema, attendi il via libera del server.'
}

 exports.statesList = states;
 exports.continentsList = continents;
 exports.symbolsList = symbols;
 exports.colorsList = colors;
 exports.playerStateList = playerState;
