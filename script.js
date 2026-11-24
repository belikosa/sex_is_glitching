// =====================================================================
// SEX IS GLITCHING — archivo
// Lee words.csv (las palabras) y data.csv (los mensajes), y pinta una
// columna por letra. Cada palabra abre su definición (diccionario.js,
// según el recorrido de recorridos.js) y los mensajes donde aparece.
// =====================================================================

let CANON = {};        // palabra -> sus formas (words.csv)
let ENTRIES = [];      // mensajes (data.csv)
let RECORRIDO = [];    // palabras pulsadas en esta visita, en orden

const tiras    = document.getElementById("tiras");
const filtros  = document.getElementById("filtros");
const buscador = document.getElementById("buscar");
let FILTRO_ANOS = new Set();   // vacío = todos los años
let FILTRO_DIR  = null;        // null = las dos direcciones

const ABECEDARIO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];


// ---------- ajustes que puedes tocar ----------

// Palabras que solo cuentan enteras: «cum» sí, pero no dentro de «cumplir».
const SOLO_ENTERAS = new Set(["cum"]);

// Palabras que solo se toman de la descripción, no de los mensajes.
const SOLO_DESCRIPCION = new Set(["cuerpo", "vulva"]);

// Mensajes que no deben salir en una palabra (se reconocen por un trozo de su texto).
const QUITAR_DE = {
  "relación": [
    "Hola Mood, Soy Sara Alastuey",
    "Hola Claudia !",
    "#OPENCALL internacional para artistas visuales",
    "BAU lanza una convocatoria a su comunidad",
    "Victor Ruiz Colomer",
  ],
};


// ---------- texto ----------
function escapeHtml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
// quita tildes pero conserva la ñ
function base(s){
  return String(s).toLowerCase().replace(/ñ/g,"\u0001").normalize("NFD")
    .replace(/[̀-ͯ]/g,"").replace(/\u0001/g,"ñ");
}
const sinEnye = t => base(t).replace(/ñ/g, "n");
const nombre = termino => termino.split(",")[0].trim();   // «chochólogo, -a, -e» -> «chochólogo»


// ---------- encontrar palabras en un texto ----------
// La palabra tiene que empezar como palabra: «puta» cuenta en «putada»,
// pero no en «computacionales»; «sex» no cuenta en «homosexual».
const LETRA = /[\p{L}\p{N}]/u;
function encajaForma(texto, pos, forma){
  if(LETRA.test(forma[0]) && pos > 0 && LETRA.test(texto[pos-1])) return false;
  const fin = pos + forma.length;
  if(SOLO_ENTERAS.has(forma) && fin < texto.length && LETRA.test(texto[fin])) return false;
  return true;
}
function contieneForma(texto, forma){
  for(let i = texto.indexOf(forma); i !== -1; i = texto.indexOf(forma, i + 1))
    if(encajaForma(texto, i, forma)) return true;
  return false;
}
function tagsForText(text){
  const t = " " + text.toLowerCase() + " ";
  return Object.keys(CANON).filter(w => CANON[w].some(f => contieneForma(t, f.toLowerCase())));
}
// marca las palabras del glosario dentro de un texto: <span class="w">
function highlightAll(text){
  const formas = [];
  for(const w in CANON) CANON[w].forEach(f => formas.push({w, f: f.toLowerCase()}));
  formas.sort((a,b) => b.f.length - a.f.length);
  const lower = text.toLowerCase();
  const encontradas = [];
  formas.forEach(({w, f}) => {
    for(let i = lower.indexOf(f); i !== -1; i = lower.indexOf(f, i + f.length))
      if(encajaForma(lower, i, f)) encontradas.push({ini: i, fin: i + f.length, w});
  });
  encontradas.sort((a,b) => a.ini - b.ini || (b.fin - b.ini) - (a.fin - a.ini));
  let html = "", cursor = 0;
  encontradas.forEach(m => {
    if(m.ini < cursor) return;
    html += escapeHtml(text.slice(cursor, m.ini)) +
      `<span class="w" data-key="${escapeHtml(m.w)}">${escapeHtml(text.slice(m.ini, m.fin))}</span>`;
    cursor = m.fin;
  });
  return html + escapeHtml(text.slice(cursor));
}


// ---------- carga ----------
function parseCSV(text){
  text = text.replace(/;+\r?\n/g, "\n").replace(/;+$/, "");   // Excel en español añade ';'
  const rows = [];
  let row = [], field = "", comillas = false;
  for(let i = 0; i < text.length; i++){
    const c = text[i];
    if(comillas){
      if(c === '"'){ if(text[i+1] === '"'){ field += '"'; i++; } else comillas = false; }
      else field += c;
    }
    else if(c === '"') comillas = true;
    else if(c === ","){ row.push(field); field = ""; }
    else if(c === "\n"){ row.push(field); rows.push(row); row = []; field = ""; }
    else if(c !== "\r") field += c;
  }
  if(field || row.length){ row.push(field); rows.push(row); }
  const cab = rows.shift().map(h => h.trim().toLowerCase());
  return rows.map(r => Object.fromEntries(cab.map((h, i) => [h, (r[i] || "").trim()])));
}

async function boot(){
  const [words, data] = await Promise.all(
    ["words.csv", "data.csv"].map(f => fetch(f, {cache: "no-store"}).then(r => r.text())));

  parseCSV(words).forEach(r => {
    if(r.categoria && r.forma) (CANON[r.categoria] ||= []).push(r.forma);
  });

  ENTRIES = parseCSV(data).filter(r => r.text).map(r => {
    const e = {
      year: Number(r.year), month: Number(r.month),
      fecha: r.fecha_larga || `${MESES[r.month - 1]} ${r.year}`,
      direction: r.direction === "by_me" ? "by_me" : "to_me",
      text: r.text,
    };
    e.tags = tagsForText(e.text).filter(t => !SOLO_DESCRIPCION.has(t)
      && !(QUITAR_DE[t] || []).some(trozo => e.text.includes(trozo)));
    return e;
  });
  ENTRIES = limpiarEntradas(ENTRIES);

  leerDescripcion();
  pintarFiltros();
  pintarTiras();
  pintarDescripcion();
}

// Solo los mensajes con alguna palabra, y sin reenvíos: si un texto largo o un
// adjunto aparece varias veces, se queda solo el más antiguo.
function limpiarEntradas(lista){
  const sinAviso = t => t.replace(/^.*?\bhas? enviado un archivo adjunto\.?\s*/i, "");
  const vistos = new Set();
  return lista.filter(e => e.tags.length)
    .sort((a,b) => (a.year*100 + a.month) - (b.year*100 + b.month))
    .filter(e => {
      if(!/enviado un archivo adjunto/i.test(e.text) && sinAviso(e.text).length < 60) return true;
      const k = sinAviso(e.text).toLowerCase().replace(/\s+/g, " ").trim();
      if(vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
}


// ---------- la descripción de «Sex is Glitching» ----------
// Cuenta como una fuente más: cada palabra que comparte con el archivo suma 1
// y enseña la frase donde aparece.
let DESCRIPCION = [];   // [{texto, tags}]
function leerDescripcion(){
  const texto = [...document.querySelectorAll(".descripcion p")].map(p => p.textContent.trim()).join(" ");
  DESCRIPCION = (texto.match(/[^.?!]+[.?!]+/g) || []).map(f => ({
    texto: f.trim(),
    tags: [...new Set([...highlightAll(f).matchAll(/data-key="([^"]+)"/g)].map(m => m[1]))],
  })).filter(f => f.tags.length);
}
const frasesDescripcion = w => DESCRIPCION.filter(f => f.tags.includes(w));

function pintarDescripcion(){
  document.querySelectorAll(".descripcion p").forEach(p => {
    p.innerHTML = highlightAll(p.textContent);
    p.querySelectorAll(".w").forEach(w => { if(!palabraLi(w.dataset.key)) w.replaceWith(w.textContent); });
  });
}
function marcarEnDescripcion(){
  const abiertas = new Set([...tiras.querySelectorAll(".pal.abierta")].map(x => x.dataset.key));
  document.querySelectorAll(".descripcion .w").forEach(w => w.classList.toggle("active", abiertas.has(w.dataset.key)));
}


// ---------- filtros ----------
const pasaFiltro = e => (!FILTRO_ANOS.size || FILTRO_ANOS.has(e.year)) && (!FILTRO_DIR || e.direction === FILTRO_DIR);

function pintarFiltros(){
  const anos = [...new Set(ENTRIES.map(e => e.year))].sort((a,b) => a - b);
  filtros.innerHTML =
    anos.map(y => `<button type="button" data-ano="${y}">${y}</button>`).join("") +
    `<span class="filtro-sep">·</span>` +
    `<button type="button" data-dir="to_me">sent to me</button>` +
    `<button type="button" data-dir="by_me">sent by me</button>` +
    `<button type="button" class="filtro-limpiar" hidden>quitar filtros</button>`;
}


// ---------- columnas A–Z ----------
function cuentaDe(w){
  return ENTRIES.filter(e => e.tags.includes(w) && pasaFiltro(e)).length + (frasesDescripcion(w).length ? 1 : 0);
}
function palabraLi(palabra){
  const b = base(palabra);
  return [...tiras.querySelectorAll(".pal")].find(x => base(x.dataset.key) === b) || null;
}

function pintarTiras(){
  // recordar qué estaba abierto para no perderlo al filtrar
  const colsAbiertas = new Set([...tiras.querySelectorAll(".col.abierta")].map(c => c.dataset.letra));
  const palsAbiertas = [...tiras.querySelectorAll(".pal.abierta")].map(p => p.dataset.key);

  const palabras = new Set();
  ENTRIES.forEach(e => e.tags.forEach(t => palabras.add(t)));
  DESCRIPCION.forEach(f => f.tags.forEach(t => palabras.add(t)));
  const porLetra = {};
  [...palabras].sort((a,b) => a.localeCompare(b, "es", {sensitivity: "base"}))
    .forEach(w => (porLetra[base(w)[0].toUpperCase()] ||= []).push(w));

  tiras.innerHTML = ABECEDARIO.map(L => {
    const pals = porLetra[L] || [];
    return `<section class="col${pals.length ? "" : " vacia"}" data-letra="${L}">
        <button type="button" class="col-letra">${L}</button>
        <div class="col-cuerpo"><ul class="col-palabras">${pals.map(w => {
          const n = cuentaDe(w);
          return `<li class="pal${n ? "" : " sin"}" data-key="${escapeHtml(w)}">
              <a href="#" class="pal-link">${escapeHtml(w)}</a><span class="pal-n">${n}</span>
              <div class="pal-detalle"></div>
            </li>`;
        }).join("")}</ul></div>
      </section>`;
  }).join("");

  colsAbiertas.forEach(L => tiras.querySelector(`.col[data-letra="${L}"]`)?.classList.add("abierta"));
  palsAbiertas.forEach(k => { const li = palabraLi(k); if(li) abrirPalabra(li, {sinRecorrido: true, sinScroll: true}); });
  if(buscador.value.trim()) aplicarBusqueda();
}


// ---------- definiciones (diccionario.js) y recorridos (recorridos.js) ----------
const PORNOMBRE = {};
DICCIONARIO.forEach(e => PORNOMBRE[base(nombre(e.termino))] = e);
const nombreDe = b => PORNOMBRE[b] ? nombre(PORNOMBRE[b].termino) : b;

// qué acepción sale según las palabras pulsadas antes
function acepcionPorRecorrido(termino, previas){
  const b = base(nombre(termino));
  const buscar = (reglas, sino) => {
    for(let i = previas.length - 1; i >= 0; i--)
      for(const r of reglas)
        if(r.desde.some(d => base(d) === previas[i])) return {num: r.acepcion, desde: previas[i]};
    return {num: sino, desde: null};
  };
  if(b === "vaginismo"){
    const cuerpo = new Set(VAGINISMO.cuerpoYDeseo.map(base));
    if(new Set(previas.filter(p => cuerpo.has(p))).size >= VAGINISMO.minimo) return {num: VAGINISMO.final, desde: null};
    return buscar(VAGINISMO.reglas, VAGINISMO.sino);
  }
  const clave = Object.keys(RECORRIDOS).find(k => base(k) === b);
  return clave ? buscar(RECORRIDOS[clave].reglas, RECORRIDOS[clave].sino) : null;
}

// «(Ver rabo)» -> «(→ rabo)» con enlace; «(Ver vaginismo, 2)» -> una sola remisión
function remisiones(def){
  return escapeHtml(def).replace(/\(Ver ([^)]+)\)/g, (m, t) => {
    const refs = [];
    t.split(",").map(x => x.trim()).forEach(x => {
      if(/^\d+$/.test(x) && refs.length) refs[refs.length - 1] += ", " + x;
      else refs.push(x);
    });
    return `<span class="remite">(→ ${refs.map(r => {
      const palabra = r.replace(/, \d+$/, "");
      return PORNOMBRE[base(palabra)] ? `<a href="#" data-palabra="${palabra}">${r}</a>` : r;
    }).join(", ")})</span>`;
  });
}

// modo: "abrir" (se añade al recorrido), "vivo" (palabra ya abierta) o "fijo" (como cuando se abrió)
function definicionHTML(palabra, modo = "abrir"){
  const e = PORNOMBRE[base(palabra)];
  if(!e) return `<p class="dic-nota">Esta palabra todavía no tiene entrada en el diccionario.</p>`;
  const yo = base(nombre(e.termino));
  const otras = RECORRIDO.filter(p => p !== yo);
  const i = RECORRIDO.indexOf(yo);
  const previas = modo === "fijo" && i >= 0 ? RECORRIDO.slice(0, i) : otras;
  if(modo === "abrir") RECORRIDO = otras.concat(yo);

  const elegida = acepcionPorRecorrido(e.termino, previas);
  let acepciones = e.acepciones;
  if(elegida){
    let a = e.acepciones.find(x => x.num === elegida.num);
    // la palabra que decide la acepción sale como una remisión más: (→ coño)
    if(a && elegida.desde){
      const desde = nombreDe(elegida.desde);
      if(!new RegExp("\\(Ver " + desde + "\\)", "i").test(a.def))
        a = {...a, def: /\)\s*$/.test(a.def) ? `${a.def.trim()} (Ver ${desde})` : `${a.def.replace(/\.?\s*$/, "")}. (Ver ${desde})`};
    }
    if(a) acepciones = [a];
  }
  return `<ol class="acepciones">${acepciones.map(a => `<li>
      ${a.num ? `<span class="num">${escapeHtml(a.num)}.</span>` : ""}
      <span class="cat">${escapeHtml(a.cat || "")}</span>
      <span class="def">${remisiones(a.def)}</span>
      ${a.ej ? `<span class="ej">${escapeHtml(a.ej)}</span>` : ""}
    </li>`).join("")}</ol>`;
}

function mensajesHTML(palabra){
  const frases = frasesDescripcion(palabra);
  const desc = frases.length ? `<div class="msg">
      <div class="msg-meta">Sex is Glitching — descripción</div>
      <div class="msg-texto">${frases.map(f => highlightAll(f.texto)).join(" ")}</div>
    </div>` : "";
  const lista = ENTRIES.filter(e => e.tags.includes(palabra) && pasaFiltro(e));
  if(!lista.length && !desc) return `<p class="vacio">Ningún mensaje con estos filtros.</p>`;
  return desc + lista.map(m => `<div class="msg">
      <div class="msg-meta">${escapeHtml(m.fecha)} — ${m.direction === "by_me" ? "sent by me" : "sent to me"}</div>
      <div class="msg-texto">${highlightAll(m.text)}</div>
    </div>`).join("");
}


// ---------- abrir y cerrar palabras ----------
function abrirPalabra(li, {sinRecorrido = false, sinScroll = false} = {}){
  const w = li.dataset.key;
  li.querySelector(".pal-detalle").innerHTML =
    `<div class="pal-def">${definicionHTML(w, sinRecorrido ? "fijo" : "abrir")}</div><div class="pal-mensajes">${mensajesHTML(w)}</div>`;
  li.classList.add("abierta");
  const col = li.closest(".col");
  col.classList.add("abierta");
  marcarEnDescripcion();
  pintarRecorrido();
  if(!sinRecorrido) actualizarAbiertas(li);
  if(!sinScroll) irA(li);
}

function cerrarPalabra(li){
  li.classList.remove("abierta");
  li.querySelector(".pal-detalle").innerHTML = "";
  marcarEnDescripcion();
}

function irA(li){
  const col = li.closest(".col");
  col.scrollIntoView({behavior: "smooth", inline: "nearest", block: "nearest"});
  setTimeout(() => {
    const cuerpo = col.querySelector(".col-cuerpo");
    cuerpo.scrollTo({top: li.offsetTop - cuerpo.offsetTop - 4, behavior: "smooth"});
  }, 250);
}

function irAPalabra(palabra){
  const li = palabraLi(palabra);
  if(!li) return;
  if(li.classList.contains("abierta")){ li.closest(".col").classList.add("abierta"); irA(li); }
  else abrirPalabra(li);
}

// las palabras ya abiertas cambian su definición en directo (con un parpadeo)
function actualizarAbiertas(excepto){
  tiras.querySelectorAll(".pal.abierta").forEach(li => {
    const def = li.querySelector(".pal-def");
    if(li === excepto || !def) return;
    const nueva = definicionHTML(li.dataset.key, "vivo");
    if(def.innerHTML === nueva) return;
    def.innerHTML = nueva;
    def.classList.remove("cambia"); void def.offsetWidth; def.classList.add("cambia");
  });
}

// «tu recorrido: …» arriba, y el botón de descargar
function pintarRecorrido(){
  const el = document.getElementById("recorrido");
  document.getElementById("descargar").hidden = !RECORRIDO.length;
  el.hidden = !RECORRIDO.length;
  el.innerHTML = RECORRIDO.length
    ? `tu recorrido: ${RECORRIDO.length > 6 ? "… → " : ""}${RECORRIDO.slice(-6).map(b => `<b>${escapeHtml(nombreDe(b))}</b>`).join(" → ")}`
    : "";
  el.title = RECORRIDO.map(nombreDe).join(" → ");
}


// ---------- buscador ----------
// filtra las palabras de todas las letras (también por sus formas: «ligo» encuentra ligar)
let colsAntesDeBuscar = null;

function aplicarBusqueda(){
  const q = sinEnye(buscador.value.trim());
  const cols = [...tiras.querySelectorAll(".col")];
  if(!q){
    tiras.classList.remove("buscando");
    tiras.querySelectorAll(".no-coincide").forEach(x => x.classList.remove("no-coincide"));
    cols.forEach(c => c.classList.remove("sin-resultado"));
    if(colsAntesDeBuscar) cols.forEach(c =>
      c.classList.toggle("abierta", colsAntesDeBuscar.has(c.dataset.letra) || !!c.querySelector(".pal.abierta")));
    colsAntesDeBuscar = null;
    return [];
  }
  colsAntesDeBuscar ||= new Set(cols.filter(c => c.classList.contains("abierta")).map(c => c.dataset.letra));
  tiras.classList.add("buscando");
  const encontradas = [];
  cols.forEach(c => {
    let hay = false;
    c.querySelectorAll(".pal").forEach(li => {
      const w = li.dataset.key;
      const si = [w, ...(CANON[w] || [])].some(f => sinEnye(f).includes(q));
      li.classList.toggle("no-coincide", !si);
      if(si){ hay = true; encontradas.push(li); }
    });
    c.classList.toggle("sin-resultado", !hay);
    c.classList.toggle("abierta", hay);
  });
  return encontradas;
}


// ---------- descargar el recorrido en PDF ----------
// Solo las palabras pulsadas, con la definición tal como salió (sin los mensajes).
// Lo genera lib/html2pdf.bundle.min.js. El diseño está al final de styles.css.
function prepararPDF(){
  const caja = document.getElementById("impresion");
  const palabras = RECORRIDO.map(b => palabraLi(b)?.dataset.key).filter(Boolean);
  const fecha = new Date().toLocaleDateString("es-ES", {day: "numeric", month: "long", year: "numeric"});
  caja.innerHTML = `
    <p class="imp-titulo">Sex is Glitching</p>
    <p class="imp-recorrido">tu recorrido, ${fecha}:<br>${palabras.map(w => `<b>${escapeHtml(w)}</b>`).join(" → ")}</p>
    ${palabras.map(w => `
      <article class="imp-palabra">
        <p class="imp-lema">${escapeHtml(w)}<span class="imp-n">${cuentaDe(w)}</span></p>
        <div class="imp-def pal-def">${definicionHTML(w, palabraLi(w).classList.contains("abierta") ? "vivo" : "fijo")}</div>
      </article>`).join("")}
    <p class="imp-creditos">Sex is Glitching es un archivo de mensajes privados ordenado como un diccionario, de La Jeta. Las definiciones de este documento se han formado con tu recorrido: otro recorrido habría escrito otro diccionario.</p>`;
  return caja;
}

// la librería solo se carga la primera vez que alguien descarga;
// la busca en la carpeta lib/ y, si no está, junto a index.html
function cargarScript(src){
  return new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = () => { s.remove(); mal(new Error("no encuentro " + src)); };
    document.head.appendChild(s);
  });
}
async function cargarHtml2pdf(){
  if(window.html2pdf) return;
  try{ await cargarScript("lib/html2pdf.bundle.min.js"); }
  catch(e){ await cargarScript("html2pdf.bundle.min.js"); }
}

async function descargar(boton){
  if(!RECORRIDO.length) return;
  const caja = prepararPDF();
  boton.textContent = "preparando…";
  boton.disabled = true;
  try{
    await cargarHtml2pdf();
    await document.fonts.ready;
    caja.classList.add("generando");
    await html2pdf().set({
      margin: [14, 16, 16, 16],                          // mm: arriba, izquierda, abajo, derecha
      filename: "sex-is-glitching-tu-recorrido.pdf",
      image: {type: "jpeg", quality: 0.95},
      html2canvas: {scale: 2, backgroundColor: "#ffffff"},
      jsPDF: {unit: "mm", format: "a4"},
      pagebreak: {mode: ["css"], avoid: [".imp-palabra"]},
    }).from(caja).toPdf().get("pdf").then(pdf => {      // pie de página
      const n = pdf.internal.getNumberOfPages();
      for(let i = 1; i <= n; i++){
        pdf.setPage(i);
        pdf.setFontSize(7.5);
        pdf.setTextColor(138);
        pdf.text("Sex is Glitching", 16, 290);
        pdf.text(`${i}/${n}`, 194, 290, {align: "right"});
      }
    }).save();
  } catch(err){
    console.error(err);
    alert("No se ha podido generar el PDF.\n\n" + (err && err.message || err));
  } finally {
    caja.classList.remove("generando");
    boton.textContent = "↓ descargar";
    boton.disabled = false;
  }
}


// ---------- clics y teclas ----------
tiras.addEventListener("click", ev => {
  const t = ev.target;
  // palabra dentro de un mensaje, o remisión (→ rabo): va a esa palabra
  const salto = t.closest(".msg-texto .w, .remite a");
  if(salto){ ev.preventDefault(); irAPalabra(salto.dataset.key || salto.dataset.palabra); return; }
  // palabra del índice: abre o cierra su detalle
  const link = t.closest(".pal-link");
  if(link){
    ev.preventDefault();
    const li = link.closest(".pal");
    li.classList.contains("abierta") ? cerrarPalabra(li) : abrirPalabra(li);
    return;
  }
  // la letra abre o cierra la columna; un clic en una columna cerrada la abre
  const col = t.closest(".col");
  if(!col || col.classList.contains("vacia")) return;
  if(t.closest(".col-letra")) col.classList.toggle("abierta");
  else col.classList.add("abierta");
});

document.querySelector(".descripcion").addEventListener("click", ev => {
  const w = ev.target.closest(".w");
  if(w) irAPalabra(w.dataset.key);
});

filtros.addEventListener("click", ev => {
  const b = ev.target.closest("button");
  if(!b) return;
  if(b.classList.contains("filtro-limpiar")){ FILTRO_ANOS.clear(); FILTRO_DIR = null; }
  else if(b.dataset.ano){ const y = Number(b.dataset.ano); FILTRO_ANOS.has(y) ? FILTRO_ANOS.delete(y) : FILTRO_ANOS.add(y); }
  else if(b.dataset.dir) FILTRO_DIR = FILTRO_DIR === b.dataset.dir ? null : b.dataset.dir;
  filtros.querySelectorAll("[data-ano]").forEach(x => x.classList.toggle("active", FILTRO_ANOS.has(Number(x.dataset.ano))));
  filtros.querySelectorAll("[data-dir]").forEach(x => x.classList.toggle("active", FILTRO_DIR === x.dataset.dir));
  filtros.querySelector(".filtro-limpiar").hidden = !(FILTRO_ANOS.size || FILTRO_DIR);
  pintarTiras();
});

buscador.addEventListener("input", aplicarBusqueda);
buscador.addEventListener("keydown", ev => {
  if(ev.key === "Enter"){ const [primera] = aplicarBusqueda(); if(primera) irAPalabra(primera.dataset.key); }
  if(ev.key === "Escape"){ buscador.value = ""; aplicarBusqueda(); }
});

document.getElementById("descargar").addEventListener("click", ev => descargar(ev.currentTarget));

// la cruz: cierra todo y empieza el recorrido de cero
document.getElementById("cerrar-todas").addEventListener("click", () => {
  tiras.querySelectorAll(".pal.abierta").forEach(cerrarPalabra);
  tiras.querySelectorAll(".col.abierta").forEach(c => c.classList.remove("abierta"));
  RECORRIDO = [];
  pintarRecorrido();
  buscador.value = ""; colsAntesDeBuscar = null; aplicarBusqueda();
});

// «Sex is Glitching» se guarda y se abre (abierta, solo el título la guarda)
document.querySelector(".lateral").addEventListener("click", ev => {
  const lateral = ev.currentTarget;
  if(!lateral.classList.contains("guardada") && !ev.target.closest(".titulo")) return;
  lateral.classList.toggle("guardada");
});

boot();