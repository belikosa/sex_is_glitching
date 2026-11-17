// Diccionario de Sex is Glitching (versión 3, desde diccionario-entradas-v3.docx)
//
// Cada entrada:
//   termino     la palabra
//   origen      p. ej. "Voz ingl." (vacío si no tiene)
//   acepciones  lista de sentidos: num (vacío si solo hay uno), cat (categoría
//               gramatical), def (definición) y ej (ejemplo del archivo)
//   ver         (sin uso: las remisiones van dentro de la definición)
//   nota        comentario al final de la entrada
// Dentro de una definición, "(Ver rabo)" se convierte en un enlace (→ rabo).
// "(Ver vaginismo, 2)" remite a la acepción 2 de vaginismo.

const DICCIONARIO = [
  {
    "termino": "anticonceptivas",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "f. pl.",
        "def": "Píldoras con efecto sobre el cuerpo y la regla.",
        "ej": "Las anticonceptivas que te hacen tener solo 4 reglas al año."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "azotes",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m. pl.",
        "def": "Deseo sobre otro cuerpo.",
        "ej": "Te quiero tumbar boca abajo sobre mis piernas y darte azotes en el culo."
      },
      {
        "num": "2",
        "cat": "m. pl.",
        "def": "Acción que se desea sobre el propio cuerpo. (Ver spanked)",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "besos",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m. pl.",
        "def": "Gesto de afecto que se da, se promete y se reclama entre amistades y parejas.",
        "ej": "Podemos quedar en mi casa a las 12, así nos damos besitos un par de horas y podemos dormirnos."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "blowjob",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Plan hipotético en un baño de discoteca.",
        "ej": "I mean in the toilet something like a blowjob."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "bonita",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "adj. f.",
        "def": "Piropo sobre personas y objetos, dicho con letras alargadas y casi siempre en respuesta a otro piropo.",
        "ej": "Bonita tú. / Bonitaaaaaaa."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "boobs",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m. pl.",
        "def": "Palabra del glosario sin ningún uso en el archivo. (Ver tits, tetas)",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "bruised",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "tr.",
        "def": "Dejar marca en el cuerpo.",
        "ej": "It would be a pleasure to leave you bruised."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "bumble",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Espacio de ligoteo.",
        "ej": "El hecho d q me suenan las caras de verlos x el bumble."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cachondo",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Que denota entusiasmo.",
        "ej": "+1000 d cachonda."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cama",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "f.",
        "def": "Lugar donde se está: se descansa, se come, se comparte y se mira el cuerpo propio o ajeno.",
        "ej": "Estoy comiendo patatas en la cama. / He compartido mucha cama contigo. / A mí me gusta en la cama porque me puedes ver el culo en el espejo."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "childish",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Reproche sobre el comportamiento de otra persona formulado desde la incomodidad.",
        "ej": "You were pretty childish, to be honest... I was a little uncomfortable."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "chocho",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Tratamiento afectuoso colectivo. (Ver chochólogo)",
        "ej": "El día d los inocentes chochos."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "choked",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Acción que se desea sobre el propio cuerpo. (Ver bruised)",
        "ej": "And being choked, with bruises."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "chupar",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "tr.",
        "def": "Acción o escena que se pide o se observa sobre otro cuerpo.",
        "ej": "De que me la chupes un poco más."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cita",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Encuentro con hora y lugar acordados con una persona que gusta.",
        "ej": "Tuve una cita con ella y es con diferencia la peor cita que he tenido en mi vida."
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Encuentro con hora y lugar acordados con una consulta.",
        "ej": "El lunes pido cita para terapia."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cock",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Parte del cuerpo propia.",
        "ej": "Using your hand on my cock."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "coño",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "interj.",
        "def": "Refuerzo de pregunta o de sorpresa.",
        "ej": "Qué coño. / Ah, coño. / Coño, q coincidencia."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Parte del cuerpo para describir altura. (Ver rabo)",
        "ej": "Si me subo a una silla te queda la cara a la altura de mi coño."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "consentimiento",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Interrogante sobre otra persona.",
        "ej": "¿Tengo tu consentimiento?"
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Tema de lectura académica.",
        "ej": "Estoy leyendo sobre consentimiento y sexo para ver si saco ideas para el TFM."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "correrse",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "prnl.",
        "def": "Deseo sobre el propio cuerpo.",
        "ej": "De que me la chupes un poco más y de corrermee."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cruising",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Plan nocturno.",
        "ej": "D disco cruising contifo."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "crush",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Interés que una tercera persona declara a través de un mensaje.",
        "ej": "My friend lowkey stalked ur profile today, she's got a lil crush on u."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cuddle",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "intr.",
        "def": "Abrazo y compañía.",
        "ej": "I have noone to cuddle here."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "culo",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Parte del cuerpo.",
        "ej": "Me duele el culo de cagar."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Base de expresiones coloquiales.",
        "ej": "Libro por el culo. / Te van a mandar a tomar x culo."
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Cuerpo deseado.",
        "ej": "Y q culo y q tetas."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "cum",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "intr.",
        "def": "Llegar al final.",
        "ej": "A bit horny maybe gonna cum until its finished."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "daddy",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Persona que paga.",
        "ej": "Un señor sugar daddy me pasa dinero por PayPal."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Denomina a a otra persona, dicho en mayúsculas.",
        "ej": "TENGO UN DUGAR DADDY DE PROFESOR DE CONSTITUCIONAL"
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Denota problemas.",
        "ej": "Daddy issues sin esconder."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "desnudo",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Cuerpo sin ropa que se mira.",
        "ej": "Osea q tú ves a gente desnuda por placer."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Dicho de una pintura.",
        "ej": "Me gustaría que hicieses un cuadro de mi desnudo."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "dick",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Parte del cuerpo en bromas y relatos.",
        "ej": "Small dick energy que te cagas."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "emoji",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Signo que acompaña el mensaje y añade tono. Se usa para despedirse, elogiar o coquetear.",
        "ej": "Salgo guapa jejeje 💋💋"
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "follar",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "intr.",
        "def": "Encuentro sexual formulado como deseo.",
        "ej": "Yo también quiero follar."
      },
      {
        "num": "2",
        "cat": "intr.",
        "def": "Propuesta.",
        "ej": "Podríamos follar o algo."
      },
      {
        "num": "3",
        "cat": "intr.",
        "def": "Verbo que denota intimidad.",
        "ej": "Conmigo lloras cuando follamos."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "fuck",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "interj.",
        "def": "Exclamación e intensificador.",
        "ej": "Fuck the way you moved your hips. / Hot as fuck."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "guapa",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "f.",
        "def": "Apelativo y piropo con letras alargadas para marcar entusiasmo.",
        "ej": "Holaa guapa, qué tal. / Qué guapaaaaaaaa."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "guapo",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Piropo a personas y a cosas, dicho en mayúsculas y alargado.",
        "ej": "QUE GUAPOOO. / Está guapísimo eso."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "hentai",
    "origen": "Voz jap.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Género de animación que se publica en la plataforma OnlyFans. (Ver onlyfans)",
        "ej": "Quería hacer como una animación hentai."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "horny",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Estado que se comunica a la otra persona.",
        "ej": "Pf im horny."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "hot",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Elogio de aspecto o de escena.",
        "ej": "You look so hot. / That was really fucking hot."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "intimidad",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Lo que se nombra en una conversación sobre límites y consentimiento.",
        "ej": "Si quieres avanzar en una relación que implica intimidad es necesario hablar de estas cosas."
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Lo que se reclama frente a otra persona.",
        "ej": "Si lo quiere leer q lo lea, sino que me deje esa intimidad."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "kink",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Pregunta.",
        "ej": "What do you think is your biggest kink?"
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "mamada",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "f.",
        "def": "Pieza de una frase hecha.",
        "ej": "Sin arcada no hay mamada."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "naked",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Palabra del glosario sin ningún uso en el archivo. (Ver desnudo)",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "nude",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Imagen online que se comparte.",
        "ej": "Send nudes. / Los nudes son en plan..."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "onlyfans",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Plataforma para proyecto de animación. (Ver hentai)",
        "ej": "Cuando me haga onlyfans de hentai, que tengo una visión."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "orgasmo",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Respuesta a algo.",
        "ej": "Orgasmo."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "pélvico",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Región del cuerpo en cuya terapia empieza un nuevo proceso.",
        "ej": "Hoy tengo mi primera terapia de suelo pélvico de mi vida."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "piquito",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Expresión de «piquito de oro».",
        "ej": "Vamos piquito de oro que me gasto."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Habla elocuente.",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "placer",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Motivo por el que se mira un cuerpo desnudo.",
        "ej": "Osea q tú ves a gente desnuda por placer."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "pleasure",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Cortesía en una escena erótica.",
        "ej": "It would be a pleasure to leave you bruised."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Objeto de la investigación.",
        "ej": "Doing a master thesis on pleasure on the internet."
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Respuesta de una sola palabra.",
        "ej": "Pleasure."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "polla",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Expresión de énfasis.",
        "ej": "Van a radiocity de polla."
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Posesión.",
        "ej": "MI POLLA."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "preciosa",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "adj. f.",
        "def": "Piropo sobre la apariencia.",
        "ej": "Estás preciosa."
      },
      {
        "num": "2",
        "cat": "adj. f.",
        "def": "Dicho de una canción: describe.",
        "ej": "Es una canción preciosa."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "pussy",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Parte del cuerpo, en escenas sexuales.",
        "ej": "Are you touching your pussy?"
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Broma.",
        "ej": "My pussy tastes like Pepsi cola."
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Denota cuidados.",
        "ej": "How is your bleeding pussy, babe?"
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "puta",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Palabra que acompaña el enunciado y le da fuerza.",
        "ej": ""
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Intensificador ante un sustantivo.",
        "ej": "La puta nevera azul. / Mi puta vida. / Una puta burrada."
      },
      {
        "num": "3",
        "cat": "f.",
        "def": "Expresión fija.",
        "ej": "Dios, he dormido de puta madre. / Ni puta idea. / Hijo de puta. / Me cago en la puta."
      },
      {
        "num": "4",
        "cat": "interj.",
        "def": "Exclamación suelta.",
        "ej": "Ostia puta. / Aaa puta."
      },
      {
        "num": "5",
        "cat": "f.",
        "def": "Vocativo entre amistades.",
        "ej": "Hola, puta."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "rabo",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Parte del cuerpo para describir altura. (Ver coño)",
        "ej": "Si me llegas a la altura del rabo que hablas."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "relación",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Vínculo cuyo tipo se negocia.",
        "ej": "¿Una relación abierta sería lo más seguro?"
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Vínculo con intimidad.",
        "ej": "Una relación que implica intimidad."
      },
      {
        "num": "3",
        "cat": "f.",
        "def": "Vínculo roto.",
        "ej": "Cómo romper una relación es difícil."
      },
      {
        "num": "4",
        "cat": "f.",
        "def": "Vínculo con dispositivos.",
        "ej": "Im so sorry si tengo una relación para social con mis dispositivos."
      }
    ],
    "ver": [],
    "nota": "Algunos mensajes recogidos bajo esta palabra son convocatorias de arte que usan la expresión «en relación con»."
  },
  {
    "termino": "seducir",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "tr.",
        "def": "Reacción a algo que se recibe como insinuación.",
        "ej": "Como me seduces."
      },
      {
        "num": "2",
        "cat": "tr.",
        "def": "Describe un campo.",
        "ej": "Lo llevas todo al campo sexual."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sex",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Acción pública.",
        "ej": "Do u like public sex."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Título de un libro de Madonna.",
        "ej": "Madonna SEX Book."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sexo",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Asunto de conversación y de negociación.",
        "ej": "No te debo sexo."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Tema académico.",
        "ej": "Estoy leyendo sobre consentimiento y sexo para ver si saco ideas para el TFM."
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Expectativa que no coincide con la de otra persona.",
        "ej": "No quería tener solo sexo y ya está."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sexting",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Práctica de sex. (Ver sex)",
        "ej": "U make sexting cute."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Práctica que se dice hacer con la pareja.",
        "ej": "Uso tus dibujos para hacer sexting con mi mujer."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sexual",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "adj.",
        "def": "Que describe la propia vida.",
        "ej": "I'm trauma dumping my sexual life."
      },
      {
        "num": "2",
        "cat": "adj.",
        "def": "Que describe la investigación académica. (Ver sex)",
        "ej": "I'm doing research in archives and webs of sexual information."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sexy",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Piropo.",
        "ej": "You loook so fucking sexy."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "spanked",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Del inglés, azotado. (Ver azotes)",
        "ej": "And being spanked."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "sugar",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Figura del dinero.",
        "ej": "Un señor sugar daddy me pasa dinero por PayPal."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "tetas",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f. pl.",
        "def": "Describe un cuerpo ajeno que se elogia.",
        "ej": "Y q culo y q tetas."
      },
      {
        "num": "2",
        "cat": "f. pl.",
        "def": "Cuerpo que se muestra.",
        "ej": "Yo he subido una foto d mis tetas."
      },
      {
        "num": "3",
        "cat": "f. pl.",
        "def": "Broma.",
        "ej": "Vale pero he engordado ahora tengo un poco de tetas."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "tinder",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Lugar de donde se encargan mensajes vía chat.",
        "ej": "Te vi en Tinder y me gustaría que hicieses un cuadro de mi desnudo."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Lugar donde las parejas buscan una tercera persona.",
        "ej": "Te hemos visto por tinder, somos una pareja que busca una chica para hacer un trío."
      },
      {
        "num": "3",
        "cat": "m.",
        "def": "Sustituido por «ligar a lo tradicional».",
        "ej": "Ya no tinder, ahora ligo a lo tradicional."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "tits",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "1",
        "cat": "m. pl.",
        "def": "Parte del cuerpo ajeno.",
        "ej": "All the hot tits pictures you send me at parties."
      },
      {
        "num": "2",
        "cat": "m. pl.",
        "def": "Parte del cuerpo que se comparte.",
        "ej": "Im gonna send u pic of my tits."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "tontear",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "intr.",
        "def": "Palabra del glosario sin ningún uso en el archivo. (Ver seducir)",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "vaginismo",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Motivo por el que se interrumpen encuentros y se cancelan planes.",
        "ej": "Dejamos de quedar por el vaginismo."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Anomalía dentro del sistema reproductivo.",
        "ej": ""
      },
      {
        "num": "3",
        "cat": "",
        "def": "(Ver xenosexualidad)",
        "ej": ""
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "vaginismus",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "m.",
        "def": "Nombre con el que se presenta uno mismo ante otra persona. (Ver vaginismo, 2)",
        "ej": "Yeah so I have smth is called vaginismus google it."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "verga",
    "origen": "",
    "acepciones": [
      {
        "num": "",
        "cat": "f.",
        "def": "Palabra que denota tanto ausencia como abundancia.",
        "ej": "Ya no hay ni verga hoy. / Ahora estarás toda hambrienta de verga."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "vínculo",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "m.",
        "def": "Unión que se quiere conservar.",
        "ej": "Me gustaría seguir teniendo relación y no perder el vínculo."
      },
      {
        "num": "2",
        "cat": "m.",
        "def": "Unión que se establece con un objeto.",
        "ej": "Has hecho un vínculo muy fuerte con la chatarra esa."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "virgen",
    "origen": "",
    "acepciones": [
      {
        "num": "1",
        "cat": "f.",
        "def": "Figura religiosa.",
        "ej": "Es el día d la virgen en la cartuja."
      },
      {
        "num": "2",
        "cat": "f.",
        "def": "Festividad religiosa.",
        "ej": "Directos a la virgen."
      },
      {
        "num": "3",
        "cat": "f.",
        "def": "Estado preguntado a una persona.",
        "ej": "Pero tú eres virgen??"
      },
      {
        "num": "4",
        "cat": "f.",
        "def": "Palabra compuesta que aparece en un cartel.",
        "ej": "Se han puesto tu cartel del coñovirgen en las uñas."
      }
    ],
    "ver": [],
    "nota": ""
  },
  {
    "termino": "wet",
    "origen": "Voz ingl.",
    "acepciones": [
      {
        "num": "",
        "cat": "adj.",
        "def": "Estado del cuerpo que se describe a otra persona.",
        "ej": "Would it help if I tell you how wet it is rn?"
      }
    ],
    "ver": [],
    "nota": ""
  }
];