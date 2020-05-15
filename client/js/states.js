const states = [
    {
      name: 'Groenlandia',
      continent: 'America Settentrionale',
      x: 482,
      y: 85,
      radius: 15
    },

    {
      name: 'Alaska',
      continent: 'America Settentrionale',
      x: 141,
      y: 127,
      radius: 15
    },

    {
      name: 'Territori del Nord-Ovest',
      continent: 'America Settentrionale',
      x: 219,
      y: 151,
      radius: 15
    },

    {
      name: 'Alberta',
      continent: 'America Settentrionale',
      x: 175,
      y: 210,
      radius: 15
    },

    {
      name: 'Ontario',      
      continent: 'America Settentrionale',
      x: 274,
      y: 256,
      radius: 15
    },

    {
      name: 'Quebec',    
      continent: 'America Settentrionale',
      x: 365,
      y: 269,
      radius: 15
    },

    {
      name: 'Stati Uniti Orientali',       
      continent: 'America Settentrionale',
      x: 228,
      y: 329,
      radius: 15
    },

    {
      name: 'Stati Uniti Occidentali',
      continent: 'America Settentrionale',
      x: 145,
      y: 276,
      radius: 15
    },

    {
      name: 'America Centrale',    
      continent: 'America Settentrionale',
      x: 127,
      y: 342,
      radius: 15
    },

    {
      name: 'Argentina',
      continent: 'America Meridionale',
      x: 184,
      y: 612,
      radius: 15
    },

    {
      name: 'Brasile',
      continent: 'America Meridionale',
      x: 267,
      y: 495,
      radius: 15
    },

    {
      name: 'Perù',
      continent: 'America Meridionale',
      x: 185,
      y: 540,
      radius: 15
    },

    {
      name: 'Venezuela',
      continent: 'America Meridionale',
      x: 183,
      y: 429,
      radius: 15
    },

    {
      name: 'Islanda',
      continent: 'Europa',
      x: 559,
      y: 146,
      radius: 15
    },

    {
      name: 'Gran Bretagna',
      continent: 'Europa',
      x: 528,
      y: 262,
      radius: 15
    },

    {
      name: 'Europa Occidentale',
      continent: 'Europa',
      x: 490,
      y: 335,
      radius: 15
    },

    {
      name: 'Scandinavia',
      continent: 'Europa',
      x: 615,
      y: 200,
      radius: 15
    },

    {
      name: 'Europa Settentrionale',
      continent: 'Europa',
      x: 617,
      y: 285,
      radius: 15
    },

    {
      name: 'Europa Meridionale',
      continent: 'Europa',
      x: 624,
      y: 328,
      radius: 15
    },

    {
      name: 'Ucraina',
      continent: 'Europa',
      x: 718,
      y: 266,
      radius: 15
    },

    {
      name: 'Egitto',
      continent: 'Africa',
      x: 658,
      y: 445,
      radius: 15
    },

    {
      name: 'Congo',
      continent: 'Africa',
      x: 610,
      y: 543,
      radius: 15
    },

    {
      name: 'Madagascar',
      continent: 'Africa',
      x: 750,
      y: 610,
      radius: 15
    },

    {
      name: 'Africa del Nord',
      continent: 'Africa',
      x: 514,
      y: 450,
      radius: 15
    },

    {
      name: 'Africa Orientale',
      continent: 'Africa',
      x: 705,
      y: 515,
      radius: 15
    },

    {
      name: 'Africa del Sud',
      continent: 'Africa',
      x: 650,
      y: 610,
      radius: 15
    },

    {
      name: 'Medio Oriente',
      continent: 'Asia',
      x: 805,
      y: 404,
      radius: 15
    },

    {
      name: 'Urali',
      continent: 'Asia',
      x: 800,
      y: 225,
      radius: 15
    },

    {
      name: 'Afganistan',
      continent: 'Asia',
      x: 820,
      y: 292,
      radius: 15
    },

    {
      name: 'India',
      continent: 'Asia',
      x: 932,
      y: 407,
      radius: 15
    },

    {
      name: 'Siam',
      continent: 'Asia',
      x: 1036,
      y: 384,
      radius: 15
    },

    {
      name: 'Cina',
      continent: 'Asia',
      x: 1004,
      y: 309,
      radius: 15
    },

    {
      name: 'Mongolia',
      continent: 'Asia',
      x: 982,
      y: 234,
      radius: 15
    },

    {
      name: 'Jacuzia',
      continent: 'Asia',
      x: 921,
      y: 122,
      radius: 15
    },

    {
      name: 'Čita',
      continent: 'Asia',
      x: 928,
      y: 205,
      radius: 15
    },

    {
      name: 'Kamchatka',
      continent: 'Asia',
      x: 1000,
      y: 111,
      radius: 15
    },

    {
      name: 'Giappone',
      continent: 'Asia',
      x: 1136,
      y: 200,
      radius: 15
    },

    {
      name: 'Nuova Guinea',
      continent: 'Oceania',
      x: 1196,
      y: 506,
      radius: 15
    },

    {
      name: 'Indonesia',
      continent: 'Oceania',
      x: 1111,
      y: 454,
      radius: 15
    },

    {
      name: 'Australia Orientale',
      continent: 'Oceania',
      x: 1165,
      y: 624,
      radius: 15
    },

    {
      name: 'Australia Occidentale',
      continent: 'Oceania',
      x: 1068,
      y: 588,
      radius: 15
    }
];

const continents = [
    {
      name: 'America Settentrionale',
      bonus: 5
    },

    {
      name: 'America Meridionale',
      bonus: 2
    },

    {
      name: 'Europa',
      bonus: 5
    },

    {
      name: 'Africa',
      bonus: 3
    },

    {
      name: 'Asia',
      bonus: 7
    },

    {
      name: 'Oceania',
      bonus: 2
    }
];