const RECORRIDOS = {
  "cita": {
    reglas: [
      { desde: ["pélvico", "vaginismo"], acepcion: "2" },
      { desde: ["tinder", "bumble", "crush", "guapa"], acepcion: "1" },
    ],
    sino: "1",
  },

  "ligar": {
    reglas: [
      { desde: ["bumble", "tinder", "cita"], acepcion: "2" },
    ],
    sino: "1",
  },

  "virgen": {
    reglas: [
      { desde: ["coño"], acepcion: "4" },
      { desde: ["cama", "follar", "sexo"], acepcion: "3" },
    ],
    sino: "1",
  },

  "relación": {
    reglas: [
      { desde: ["sexual", "orgasmo", "pélvico"], acepcion: "6" },
      { desde: ["intimidad", "consentimiento"], acepcion: "2" },
      { desde: ["tinder", "sexo"], acepcion: "1" },
      { desde: ["sexting"], acepcion: "4" },
    ],
    sino: "4",
  },

  "daddy": {
    reglas: [
      { desde: ["sugar"], acepcion: "1" },
      { desde: ["vaginismo", "consentimiento"], acepcion: "3" },
    ],
    sino: "2",
  },

  "desnudo": {
    reglas: [
      { desde: ["tinder"], acepcion: "2" },
    ],
    sino: "1",
  },

  "pleasure": {
    reglas: [
      { desde: ["bruised", "choked", "spanked"], acepcion: "1" },
      { desde: ["sexual", "consentimiento"], acepcion: "2" },
    ],
    sino: "1",
  },

  "azotes": {
    reglas: [
      { desde: ["choked", "bruised"], acepcion: "2" },
    ],
    sino: "1",
  },

  "puta": {
    reglas: [
      { desde: ["guapa", "besos"], acepcion: "5" },
      { desde: ["fuck", "coño"], acepcion: "4" },
    ],
    sino: "2",
  },
};

const VAGINISMO = {
  minimo: 5,
  cuerpoYDeseo: [
    "coño", "culo", "tetas", "polla", "rabo", "pussy", "cock", "dick", "tits",
    "follar", "correrse", "orgasmo", "desnudo", "placer", "cama", "chupar",
    "mamada", "azotes", "choked", "bruised", "spanked", "cachondo", "horny",
    "wet", "sexo", "sex", "sexual", "nude",
  ],
  reglas: [
    { desde: ["pélvico", "anticonceptivas"], acepcion: "2" },
  ],
  sino: "1",
  final: "3",
};