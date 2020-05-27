const states = [
  {
    name: 'Groenlandia',
    continent: 'America Settentrionale',
    x: 364,
    y: 63,
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
    x: 106,
    y: 95,
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
    x: 166,
    y: 116,
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
    x: 131,
    y: 157,
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
    x: 206,
    y: 192,
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
    x: 275,
    y: 203,
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
    x: 170,
    y: 245,
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
    x: 110,
    y: 208,
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
    x: 91,
    y: 257,
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
    x: 136,
    y: 460,
    radius: 20,
    neighbor: [
      'Perù',
      'Brasile'
    ]
  },

  {
    name: 'Brasile',
    continent: 'America Meridionale',
    x: 200,
    y: 374,
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
    x: 140,
    y: 405,
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
    x: 137,
    y: 325,
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
    x: 420,
    y: 110,
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
    x: 400,
    y: 200,
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
    x: 370,
    y: 250,
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
    x: 460,
    y: 153,
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
    x: 465,
    y: 213,
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
    x: 470,
    y: 248,
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
    x: 540,
    y: 203,
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
    x: 495,
    y: 336,
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
    x: 461,
    y: 406,
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
    x: 566,
    y: 458,
    radius: 20,
    neighbor: [
      'Africa Orientale',
      'Africa del Sud'
    ]
  },

  {
    name: 'Africa del Nord',
    continent: 'Africa',
    x: 386,
    y: 340,
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
    x: 534,
    y: 388,
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
    x: 488,
    y: 462,
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
    x: 608,
    y: 300,
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
    x: 605,
    y: 172,
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
    x: 620,
    y: 220,
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
    x: 700,
    y: 305,
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
    x: 779,
    y: 290,
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
    x: 759,
    y: 233,
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
    x: 740,
    y: 179,
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
    x: 694,
    y: 92,
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
    x: 643,
    y: 147,
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
    x: 699,
    y: 152,
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
    x: 753,
    y: 83,
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
    x: 855,
    y: 151,
    radius: 20,
    neighbor: [
      'Kamchatka',
      'Mongolia'
    ]
  },

  {
    name: 'Nuova Guinea',
    continent: 'Oceania',
    x: 901,
    y: 382,
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
    x: 836,
    y: 339,
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
    x: 875,
    y: 467,
    radius: 20,
    neighbor: [
      'Australia Occidentale',
      'Nuova Guinea'
    ]
  },

  {
    name: 'Australia Occidentale',
    continent: 'Oceania',
    x: 803,
    y: 443,
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
  Cannone: 4,
  Fante: 6,
  Cavaliere: 8,
  Diversi: 10,
  Jolly: 12
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
  WAITER: 'Non è il tuo turno, un altro giocatore sta effettuando le proprie mosse.',
  IDLE: 'Sei correttamente registrato nel sistema, attendi il via libera del server.',
  FIRST: 'Questo è il primo turno, ti abbiamo affidato truppe bonus e in automatico abbiamo posto un carro armato a difesa dei tuoi territori. Colloca il resto dei carri a tua disposizione, in seguito verrà automaticamente passato il turno. Ma solo questa volta!'
}

const firstTroopAssignment = {
  2: 40,
  3: 35,
  4: 30
}

 exports.statesList = states;
 exports.continentsList = continents;
 exports.symbolsList = symbols;
 exports.colorsList = colors;
 exports.playerStateList = playerState;
 exports.firstTroopAssignmentList = firstTroopAssignment;
