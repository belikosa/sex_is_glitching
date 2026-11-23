// Recorridos: la definición que sale en la columna de la derecha depende de
// las palabras que la persona ha pulsado antes.
//
// Para cada palabra:
//   reglas  lista de { desde: [palabras], acepcion: "n" }.
//           Se mira el recorrido hacia atrás, de la última palabra pulsada a la
//           primera: la primera palabra que aparezca en alguna regla decide.
//   sino    acepción que sale si ninguna palabra del recorrido encaja.
//
// Las palabras se escriben como en el diccionario; tildes y mayúsculas dan igual.
// Las palabras que no están aquí enseñan todas sus acepciones, como siempre.

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

// Vaginismo depende de todo el recorrido, no de una sola palabra:
// cuando la persona ha pasado por al menos MINIMO palabras distintas del cuerpo
// y del deseo, la definición se convierte en la acepción 3 (→ xenosexualidad).
const VAGINISMO = {
  minimo: 5,
  cuerpoYDeseo: [
    "coño", "culo", "tetas", "polla", "rabo", "pussy", "cock", "dick", "tits",
    "follar", "correrse", "orgasmo", "desnudo", "placer", "cama", "chupar",
    "mamada", "azotes", "choked", "bruised", "spanked", "cachondo", "horny",
    "wet", "sexo", "sex", "sexual", "nude",
  ],
  // antes de llegar al mínimo:
  reglas: [
    { desde: ["pélvico", "anticonceptivas"], acepcion: "2" },
  ],
  sino: "1",
  final: "3",
};
