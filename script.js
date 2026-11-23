const LS_KEY = "diccionario_entries_override";

let CANON = null;      // se carga desde data.json
let ENTRIES = null;    // lista activa (default o subida por CSV)

function escapeHtml(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// La palabra tiene que empezar como palabra: «puta» cuenta en «putada»,
// pero no en «computacionales»; «sex» no cuenta en «homosexual».
const LETRA = /[\p{L}\p{N}]/u;
function empiezaPalabra(texto, pos){
  return pos === 0 || !LETRA.test(texto[pos-1]);
}
// Palabras que solo cuentan enteras: «cum» sí, pero no dentro de «cumplir».
// Para añadir otra, escríbela aquí en minúsculas.
const SOLO_ENTERAS = new Set(["cum"]);
function acabaPalabra(texto, fin){
  return fin >= texto.length || !LETRA.test(texto[fin]);
}
function encajaForma(texto, pos, forma){
  if(LETRA.test(forma[0]) && !empiezaPalabra(texto, pos)) return false;
  if(SOLO_ENTERAS.has(forma) && !acabaPalabra(texto, pos + forma.length)) return false;
  return true;
}
function contieneForma(texto, forma){
  let i = 0;
  while((i = texto.indexOf(forma, i)) !== -1){
    if(encajaForma(texto, i, forma)) return true;
    i += 1;
  }
  return false;
}

// palabras que solo se toman de la descripción, no de los mensajes
const SOLO_DESCRIPCION = new Set(["cuerpo", "vulva"]);

function tagsForText(text){
  const t = " " + text.toLowerCase() + " ";
  const found = [];
  for(const canon in CANON){
    if(canon === "intimo") continue;
    for(const form of CANON[canon]){
      if(form === "___never___") continue;
      if(contieneForma(t, form.toLowerCase())){ found.push(canon); break; }
    }
  }
  return found.length ? found : ["intimo"];
}

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function normalizeEntry(row){
  // row: {fecha_larga?, year, month, direction, text}
  const year = Number(row.year);
  const month = Number(row.month);
  const fecha_larga = row.fecha_larga && row.fecha_larga.trim()
    ? row.fecha_larga.trim()
    : `${MESES[month-1] || "?"} ${year}`;
  const direction = (row.direction || "").trim() === "by_me" ? "by_me" : "to_me";
  const text = (row.text || "").trim();
  return {
    fecha_larga, year, month, direction, text,
    tags: tagsForText(text).filter(t => !SOLO_DESCRIPCION.has(t)),
  };
}

// ---------- carga inicial ----------
async function boot(){
  // ---- 1) resolver el glosario de palabras (CANON) ----
  // por defecto, el incrustado en este archivo
  CANON = {}; // el glosario vive solo en words.csv ahora
  try{
    const resWords = await fetch("words.csv", {cache: "no-store"});
    if(resWords.ok){
      let wtext = await resWords.text();
      wtext = wtext.replace(/;+\r?\n/g, "\n").replace(/;+$/, "");
      const wrows = parseCSV(wtext);
      const whead = wrows[0].map(h=>h.trim().toLowerCase());
      const ci = whead.indexOf("categoria");
      const fi = whead.indexOf("forma");
      if(ci > -1 && fi > -1){
        const newCanon = {};
        wrows.slice(1).forEach(r=>{
          const cat = (r[ci]||"").trim();
          const form = (r[fi]||"").trim();
          if(!cat || !form) return;
          if(!newCanon[cat]) newCanon[cat] = [];
          newCanon[cat].push(form);
        });
        if(Object.keys(newCanon).length){
          CANON = newCanon;
        }
      }
    }
  }catch(e){
    // sin servidor local -> se queda con el CANON incrustado
  }

  // ---- 2) resolver los mensajes (ENTRIES) ----
  // 2a) intenta cargar data.csv por fetch (funciona con Live Server / cualquier servidor local,
  //     NO funciona si abres el html con doble clic directamente -- ahi cae al paso 2b)
  try{
    const res = await fetch("data.csv", {cache: "no-store"});
    if(res.ok){
      let text = await res.text();
      // Excel (config regional española) mete un ';' de más al final de cada línea
      // al exportar CSV "separado por comas" -- lo quitamos aquí para que nunca rompa la carga
      text = text.replace(/;+\r?\n/g, "\n").replace(/;+$/, "");
      const rows = parseCSV(text);
      const header = rows[0].map(h=>h.trim().toLowerCase());
      const idx = {
        fecha_larga: header.indexOf("fecha_larga"),
        year: header.indexOf("year"),
        month: header.indexOf("month"),
        direction: header.indexOf("direction"),
        text: header.indexOf("text"),
      };
      const dataRows = rows.slice(1).filter(r => r[idx.text] && r[idx.text].trim());
      ENTRIES = dataRows.map(r => normalizeEntry({
        fecha_larga: idx.fecha_larga>-1 ? r[idx.fecha_larga] : "",
        year: r[idx.year], month: r[idx.month], direction: r[idx.direction], text: r[idx.text],
      }));
      setStatus("cargado desde data.csv + words.csv (" + ENTRIES.length + " mensajes, " + Object.keys(CANON).length + " palabras) — recarga tras guardar cambios en VS Code");
      renderCloud();
      return;
    }
  }catch(e){
    // fetch bloqueado (abierto con doble clic, sin servidor) -> seguimos al paso 2b
  }

  // 2b) si no hay data.csv accesible: mira si hay algo subido manualmente antes
  const saved = localStorage.getItem(LS_KEY);
  if(saved){
    try{
      const rows = JSON.parse(saved);
      ENTRIES = rows.map(normalizeEntry);
      setStatus("cargado desde tu último CSV subido (" + ENTRIES.length + " mensajes)");
    }catch(e){
      ENTRIES = DATA_DEFAULT.entries;
      setStatus("error leyendo tu CSV guardado, usando el original");
    }
  } else {
    // 2c) corpus incrustado de siempre, como red de seguridad
    ENTRIES = DATA_DEFAULT.entries;
    setStatus(ENTRIES.length + " mensajes (versión incrustada -- abre con Live Server para leer data.csv/words.csv)");
  }
  renderCloud();
}

function setStatus(msg){
  const el = document.getElementById("status");
  if(el) el.textContent = msg;
}

// ---------- CSV export ----------
function csvEscape(s){
  s = String(s ?? "");
  if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
  return s;
}

function downloadCSV(){
  const header = ["fecha_larga","year","month","direction","text"];
  const lines = [header.join(",")];
  ENTRIES.forEach(e=>{
    lines.push([e.fecha_larga, e.year, e.month, e.direction, e.text].map(csvEscape).join(","));
  });
  const csv = lines.join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "diccionario_datos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- CSV import (parser simple, soporta comillas y comas dentro de campos) ----------
function parseCSV(text){
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for(let i=0; i<text.length; i++){
    const c = text[i];
    if(inQuotes){
      if(c === '"'){
        if(text[i+1] === '"'){ field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if(c === '"') inQuotes = true;
      else if(c === ','){ row.push(field); field = ""; }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ""; }
      else if(c === '\r'){ /* skip */ }
      else field += c;
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || r[0] !== "");
}

function handleCSVFile(file){
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      let text = ev.target.result;
      text = text.replace(/;+\r?\n/g, "\n").replace(/;+$/, "");
      const rows = parseCSV(text);
      const header = rows[0].map(h=>h.trim().toLowerCase());
      const idx = {
        fecha_larga: header.indexOf("fecha_larga"),
        year: header.indexOf("year"),
        month: header.indexOf("month"),
        direction: header.indexOf("direction"),
        text: header.indexOf("text"),
      };
      if(idx.year === -1 || idx.month === -1 || idx.direction === -1 || idx.text === -1){
        setStatus("error: el CSV necesita columnas year, month, direction, text");
        return;
      }
      const dataRows = rows.slice(1).filter(r => r[idx.text] && r[idx.text].trim());
      const parsed = dataRows.map(r => ({
        fecha_larga: idx.fecha_larga>-1 ? r[idx.fecha_larga] : "",
        year: r[idx.year],
        month: r[idx.month],
        direction: r[idx.direction],
        text: r[idx.text],
      }));
      localStorage.setItem(LS_KEY, JSON.stringify(parsed));
      ENTRIES = parsed.map(normalizeEntry);
      setStatus("CSV cargado: " + ENTRIES.length + " mensajes");
      renderCloud();
    }catch(err){
      setStatus("error leyendo el CSV: " + err.message);
    }
  };
  reader.readAsText(file, "utf-8");
}

function restoreOriginal(){
  localStorage.removeItem(LS_KEY);
  boot();
}

// =====================================================================
// ARCHIVO EN TIRAS (abecedario)
// Cada palabra del glosario es una tira vertical. Cerrada es un lomo con la
// inicial y la palabra; abierta enseña su definición (según el recorrido) y
// debajo sus mensajes. Los años y la dirección filtran todas las tiras.
// =====================================================================

const tiras   = document.getElementById("tiras");
const filtros = document.getElementById("filtros");

let FILTRO_ANOS = new Set();   // vacío = todos los años
let FILTRO_DIR  = null;        // null = las dos direcciones

function slugPalabra(s){
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9ñ]+/g,"-").replace(/ñ/g,"n").replace(/^-|-$/g,"");
}

function entradaDe(palabra){
  if(typeof PORNOMBRE === "undefined") return null;
  const b = base(String(palabra));
  if(PORNOMBRE[b]) return PORNOMBRE[b];
  // términos propios (xenosexualidad…)
  return (window.TERMINOS || []).find(e => base(e.termino.split(",")[0].trim()) === b) || null;
}

function pasaFiltro(e){
  if(FILTRO_ANOS.size && !FILTRO_ANOS.has(e.year)) return false;
  if(FILTRO_DIR && e.direction !== FILTRO_DIR) return false;
  return true;
}

// ---------- qué mensajes salen en la web ----------
// 1) Solo los que contienen alguna palabra del glosario (words.csv).
// 2) Sin reenvíos: si el mismo texto aparece varias veces (recibido y
//    reenviado), se queda solo el más antiguo.
function sinAviso(texto){
  // «Has enviado un archivo adjunto.» / «X ha enviado un archivo adjunto.»
  return texto.replace(/^.*?\bhas? enviado un archivo adjunto\.?\s*/i, "");
}
function claveTexto(texto){
  return sinAviso(texto).toLowerCase().replace(/\s+/g, " ").trim();
}
// mensajes que no deben salir en una palabra concreta (se reconocen por un trozo de su texto)
const QUITAR_DE = {
  "relación": [
    "Hola Mood, Soy Sara Alastuey",
    "Hola Claudia !",
    "#OPENCALL internacional para artistas visuales",
    "BAU lanza una convocatoria a su comunidad",
    "Victor Ruiz Colomer",
  ],
};
function quitarDePalabras(e){
  const t = e.text.trim();
  for(const w in QUITAR_DE){
    if(e.tags.includes(w) && QUITAR_DE[w].some(trozo => t.includes(trozo))){
      e.tags = e.tags.filter(x => x !== w);
      if(!e.tags.length) e.tags = ["intimo"];
    }
  }
  return e;
}

function prepararEntradas(lista){
  lista.forEach(quitarDePalabras);
  const conPalabras = lista.filter(e => !(e.tags.length === 1 && e.tags[0] === "intimo"));
  conPalabras.sort((a,b) => (a.year*100 + a.month) - (b.year*100 + b.month));
  const vistos = new Set();
  return conPalabras.filter(e => {
    // los mensajes cortos que se repiten («So hot», «Jajaja») son mensajes distintos:
    // solo se tratan como reenvío los adjuntos reenviados y los textos largos
    const esReenvio = /enviado un archivo adjunto/i.test(e.text) || sinAviso(e.text).length >= 60;
    if(!esReenvio) return true;
    const k = claveTexto(e.text);
    if(vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

function highlightAll(text){
  const allForms = [];
  Object.keys(CANON).forEach(canon=>{
    if(canon === "intimo") return;
    CANON[canon].forEach(f=>{
      if(f === "___never___") return;
      allForms.push({canon, form:f});
    });
  });
  allForms.sort((a,b)=> b.form.length - a.form.length);

  const lower = text.toLowerCase();
  const matches = [];
  allForms.forEach(({canon, form})=>{
    const f = form.toLowerCase();
    let idx = 0;
    while(true){
      const pos = lower.indexOf(f, idx);
      if(pos === -1) break;
      if(encajaForma(lower, pos, f))
        matches.push({start:pos, end:pos+f.length, canon});
      idx = pos + f.length;
    }
  });

  matches.sort((a,b)=> a.start - b.start || (b.end-b.start) - (a.end-a.start));
  const accepted = [];
  let lastEnd = -1;
  matches.forEach(m=>{
    if(m.start >= lastEnd){
      accepted.push(m);
      lastEnd = m.end;
    }
  });

  let result = "";
  let cursor = 0;
  accepted.forEach(m=>{
    result += escapeHtml(text.slice(cursor, m.start));
    result += `<span class="w" data-type="word" data-key="${m.canon}">${escapeHtml(text.slice(m.start, m.end))}</span>`;
    cursor = m.end;
  });
  result += escapeHtml(text.slice(cursor));
  return result;
}

// ---------- recorridos (recorridos.js) ----------
// Palabras pulsadas en esta visita, en orden. Decide qué acepción se enseña.
let RECORRIDO = [];

function acepcionPorRecorrido(termino, previas){
  const b = base(termino.split(",")[0].trim());
  const buscar = (reglas, sino) => {
    for(let i = previas.length - 1; i >= 0; i--){
      for(const r of reglas){
        if(r.desde.some(d => base(d) === previas[i])) return {num: r.acepcion, desde: previas[i]};
      }
    }
    return {num: sino, desde: null};
  };
  if(typeof VAGINISMO !== "undefined" && b === "vaginismo"){
    const cuerpo = new Set(VAGINISMO.cuerpoYDeseo.map(base));
    const vistas = new Set(previas.filter(p => cuerpo.has(p)));
    if(vistas.size >= VAGINISMO.minimo) return {num: VAGINISMO.final, desde: "recorrido"};
    return buscar(VAGINISMO.reglas, VAGINISMO.sino);
  }
  if(typeof RECORRIDOS === "undefined") return null;
  const clave = Object.keys(RECORRIDOS).find(k => base(k) === b);
  if(!clave) return null;
  return buscar(RECORRIDOS[clave].reglas, RECORRIDOS[clave].sino);
}

// las palabras que ya están abiertas cambian su definición en directo
function actualizarAbiertas(excepto){
  tiras.querySelectorAll(".pal.abierta").forEach(li => {
    if(li === excepto) return;
    const def = li.querySelector(".pal-def");
    if(!def) return;
    const nueva = definicionHTML(li.dataset.key, "vivo");
    if(def.innerHTML === nueva) return;
    def.innerHTML = nueva;
    def.classList.remove("cambia"); void def.offsetWidth; def.classList.add("cambia");
  });
}

// enseña arriba las últimas palabras pulsadas, que son las que cambian las definiciones
function pintarRecorrido(){
  const el = document.getElementById("recorrido");
  if(!el) return;
  const boton = document.getElementById("descargar");
  if(boton) boton.hidden = !RECORRIDO.length;
  if(!RECORRIDO.length){ el.hidden = true; el.innerHTML = ""; return; }
  const ultimas = RECORRIDO.slice(-6).map(b => `<b>${escapeHtml(nombreDe(b))}</b>`).join(" → ");
  el.innerHTML = `tu recorrido: ${RECORRIDO.length > 6 ? "… → " : ""}${ultimas}`;
  el.title = RECORRIDO.map(nombreDe).join(" → ");
  el.hidden = false;
}

// ---------- descargar el recorrido ----------
// Solo las palabras que has pulsado, en ese orden, con la definición tal como
// te ha salido y sus mensajes. El PDF se genera directamente, sin imprimir
// (con lib/html2pdf.bundle.min.js). El diseño está en impresion.css.
function prepararImpresion(){
  const caja = document.getElementById("impresion");
  if(!caja || !RECORRIDO.length) return null;
  const palabras = RECORRIDO.map(b => palabraLi(b)?.dataset.key).filter(Boolean);
  const fecha = new Date().toLocaleDateString("es-ES", {day: "numeric", month: "long", year: "numeric"});
  caja.innerHTML = `
    <p class="imp-titulo">Sex is Glitching</p>
    <p class="imp-recorrido">tu recorrido, ${escapeHtml(fecha)}:<br>${palabras.map(w => `<b>${escapeHtml(w)}</b>`).join(" → ")}</p>
    ${palabras.map(w => `
      <article class="imp-palabra">
        <p class="imp-lema">${escapeHtml(w)}<span class="imp-n">${cuentaDe(w)}</span></p>
        <div class="imp-def pal-def">${definicionHTML(w, palabraLi(w)?.classList.contains("abierta") ? "vivo" : true)}</div>
        ${mensajesHTML(w)}
      </article>`).join("")}
    <p class="imp-creditos">Sex is Glitching es un archivo de mensajes privados ordenado como un diccionario, de La Jeta. Las definiciones de este documento se han formado con tu recorrido: otro recorrido habría escrito otro diccionario.</p>`;
  return caja;
}

// la librería solo se carga la primera vez que alguien descarga
function cargarHtml2pdf(){
  if(window.html2pdf) return Promise.resolve();
  return new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = "lib/html2pdf.bundle.min.js";
    s.onload = ok; s.onerror = mal;
    document.head.appendChild(s);
  });
}

const botonDescargar = document.getElementById("descargar");
botonDescargar?.addEventListener("click", async () => {
  const caja = prepararImpresion();
  if(!caja) return;
  const texto = botonDescargar.textContent;
  botonDescargar.textContent = "preparando…";
  botonDescargar.disabled = true;
  try{
    await cargarHtml2pdf();
    await document.fonts.ready;
    caja.classList.add("generando");
    await html2pdf().set({
      margin: [14, 16, 16, 16],                         // mm: arriba, izquierda, abajo, derecha
      filename: "sex-is-glitching-tu-recorrido.pdf",
      image: {type: "jpeg", quality: 0.95},
      html2canvas: {scale: 2, backgroundColor: "#ffffff"},
      jsPDF: {unit: "mm", format: "a4", orientation: "portrait"},
      pagebreak: {mode: ["css"], avoid: [".msg", ".imp-def", ".imp-lema"]},
    }).from(caja).toPdf().get("pdf").then(pdf => {
      // número de página abajo a la derecha
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
    alert("No se ha podido generar el PDF.");
  } finally {
    caja.classList.remove("generando");
    botonDescargar.textContent = texto;
    botonDescargar.disabled = false;
  }
});

function nombreDe(b){
  const e = PORNOMBRE[b];
  return e ? e.termino.split(",")[0].trim() : b;
}



// ---------- pintar: una columna por letra, como HHHA ----------
const ABECEDARIO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function renderCloud(){
  ENTRIES = prepararEntradas(ENTRIES);
  leerDescripcion();
  pintarFiltros();
  pintarTiras();
  pintarDescripcion();
  abrirDesdeDireccion();
}

// la descripción del proyecto: sus palabras del glosario se pueden clicar
// (las de los términos propios ya vienen marcadas en index.html)
function pintarDescripcion(){
  document.querySelectorAll(".descripcion p").forEach(p => {
    const textos = [];
    const paseo = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    while(paseo.nextNode()){
      const n = paseo.currentNode;
      if(!n.parentElement.closest(".w, .nombre")) textos.push(n);
    }
    textos.forEach(n => {
      const caja = document.createElement("span");
      caja.innerHTML = highlightAll(n.textContent);
      // solo enlazamos las que tienen columna en el archivo
      caja.querySelectorAll(".w").forEach(w => {
        if(!palabraLi(w.dataset.key)) w.replaceWith(document.createTextNode(w.textContent));
      });
      n.replaceWith(...caja.childNodes);
    });
  });
}

document.querySelector(".descripcion")?.addEventListener("click", ev => {
  const w = ev.target.closest(".w");
  if(w) irAPalabra(w.dataset.key);
});

function pintarFiltros(){
  if(!filtros) return;
  const anos = [...new Set(ENTRIES.map(e => e.year))].sort((a,b) => a-b);
  filtros.innerHTML =
    anos.map(y => `<button type="button" class="filtro" data-ano="${y}">${y}</button>`).join("") +
    `<span class="filtro-sep">·</span>` +
    `<button type="button" class="filtro" data-dir="to_me">sent to me</button>` +
    `<button type="button" class="filtro" data-dir="by_me">sent by me</button>` +
    `<button type="button" class="filtro-limpiar" hidden>quitar filtros</button>`;
}

// La descripción de «Sex is Glitching» cuenta como una fuente más del archivo:
// cada palabra que comparte con él suma 1 y enseña las frases donde aparece.
let DESCRIPCION = [];   // [{texto, tags}]
function leerDescripcion(){
  const texto = [...document.querySelectorAll(".descripcion p")].map(p => p.textContent.trim()).join(" ");
  DESCRIPCION = (texto.match(/[^.?!]+[.?!]+/g) || []).map(f => {
    const frase = f.trim();
    // solo las palabras que se marcan en el texto (en «sexual» cuenta sexual, no sex)
    const tags = [...new Set([...highlightAll(f.trim()).matchAll(/data-key="([^"]+)"/g)].map(m => m[1]))];
    return {texto: frase, tags};
  }).filter(f => f.tags.length);
}
function frasesDescripcion(w){ return DESCRIPCION.filter(f => f.tags.includes(w)); }

function palabrasOrdenadas(){
  const set = new Set();
  ENTRIES.forEach(e => e.tags.forEach(t => { if(t !== "intimo") set.add(t); }));
  DESCRIPCION.forEach(f => f.tags.forEach(t => set.add(t)));
  return [...set].sort((a,b) => a.localeCompare(b, "es", {sensitivity:"base"}));
}

function cuentaDe(w){
  return ENTRIES.filter(e => e.tags.includes(w) && pasaFiltro(e)).length
       + (frasesDescripcion(w).length ? 1 : 0);
}

function letraDePalabra(w){
  const c = base(w).charAt(0).toUpperCase();
  return ABECEDARIO.includes(c) ? c : "#";
}

function pintarTiras(){
  // recordar qué estaba abierto para no perderlo al filtrar
  const colsAbiertas = new Set([...tiras.querySelectorAll(".col.abierta")].map(c => c.dataset.letra));
  const palsAbiertas = new Set([...tiras.querySelectorAll(".pal.abierta")].map(p => p.dataset.key));

  const porLetra = {};
  palabrasOrdenadas().forEach(w => { (porLetra[letraDePalabra(w)] ||= []).push(w); });

  tiras.innerHTML = ABECEDARIO.map(L => {
    const pals = porLetra[L] || [];
    const lista = pals.map(w => {
      const n = cuentaDe(w);
      return `<li class="pal${n ? "" : " sin"}" data-key="${escapeHtml(w)}">
          <a href="#${slugPalabra(w)}" class="pal-link" data-key="${escapeHtml(w)}">${escapeHtml(w)}</a><span class="pal-n">${n}</span>
          <div class="pal-detalle"></div>
        </li>`;
    }).join("");
    return `<section class="col${pals.length ? "" : " vacia"}" data-letra="${L}" id="letra-${L}">
        <button type="button" class="col-letra" aria-label="letra ${L}">${L}</button>
        <div class="col-cuerpo">${pals.length ? `<ul class="col-palabras">${lista}</ul>` : ""}</div>
      </section>`;
  }).join("");

  colsAbiertas.forEach(L => tiras.querySelector(`.col[data-letra="${L}"]`)?.classList.add("abierta"));
  // si había una búsqueda escrita, se vuelve a aplicar tras repintar
  palsAbiertas.forEach(k => {
    const li = tiras.querySelector(`.pal[data-key="${CSS.escape(k)}"]`);
    if(li) abrirPalabra(li, {sinRecorrido: true, sinScroll: true});
  });
  if(typeof aplicarBusqueda === "function" && buscador?.value.trim()) aplicarBusqueda();
}

// ---------- definición y mensajes de una palabra ----------
function definicionHTML(palabra, sinRecorrido){
  const e = entradaDe(palabra);
  if(!e) return `<p class="dic-nota">Esta palabra todavía no tiene entrada en el diccionario.</p>`;
  const yo = base(e.termino.split(",")[0].trim());
  let elegida;
  if(!sinRecorrido){
    elegida = acepcionPorRecorrido(e.termino, RECORRIDO.filter(p => p !== yo));
    RECORRIDO = RECORRIDO.filter(p => p !== yo).concat(yo);
  } else if(sinRecorrido === "vivo"){
    // palabra ya abierta: se recalcula con todo lo pulsado después
    elegida = acepcionPorRecorrido(e.termino, RECORRIDO.filter(p => p !== yo));
  } else {
    const i = RECORRIDO.indexOf(yo);
    elegida = acepcionPorRecorrido(e.termino, i < 0 ? RECORRIDO : RECORRIDO.slice(0, i));
  }
  let acep = elegida && e.acepciones.find(a => a.num === elegida.num);
  // la palabra del recorrido que decide la acepción sale como una remisión más: (→ coño)
  if(acep && elegida.desde && elegida.desde !== "recorrido"){
    const desde = nombreDe(elegida.desde);
    if(!new RegExp("\\(Ver " + desde + "\\)", "i").test(acep.def))
      acep = {...acep, def: /\)\s*$/.test(acep.def)
        ? acep.def.trim() + " (Ver " + desde + ")"                    // ya acaba en una remisión
        : acep.def.replace(/\.?\s*$/, "") + ". (Ver " + desde + ")"};
  }
  const html = entrada(acep ? {...e, acepciones: [acep]} : e);
  return html.replace(/ id="[^"]*"/g, "").replace(/href="#/g, 'href="diccionario.html#');
}

function mensajesHTML(palabra){
  const lista = ENTRIES.filter(e => e.tags.includes(palabra) && pasaFiltro(e))
    .sort((a,b) => (a.year*100+a.month) - (b.year*100+b.month));
  const frases = frasesDescripcion(palabra);
  const desc = frases.length ? `<div class="msg msg-desc">
      <div class="msg-meta">Sex is Glitching — descripción</div>
      <div class="msg-texto">${frases.map(f => highlightAll(f.texto)).join(" ")}</div>
    </div>` : "";
  if(!lista.length) return desc + (desc ? "" : `<p class="vacio">Ningún mensaje con estos filtros.</p>`);
  return desc + lista.map(m => `<div class="msg">
      <div class="msg-meta">${escapeHtml(m.fecha_larga)} — ${m.direction === "by_me" ? "sent by me" : "sent to me"}</div>
      <div class="msg-texto">${highlightAll(m.text)}</div>
    </div>`).join("");
}

function abrirPalabra(li, {sinRecorrido = false, sinScroll = false} = {}){
  const w = li.dataset.key;
  li.querySelector(".pal-detalle").innerHTML =
    `<div class="pal-def">${definicionHTML(w, sinRecorrido)}</div><div class="pal-mensajes">${mensajesHTML(w)}</div>`;
  li.classList.add("abierta");
  marcarEnDescripcion();
  pintarRecorrido();
  if(!sinRecorrido) actualizarAbiertas(li);
  const col = li.closest(".col");
  col.classList.add("abierta");
  if(!sinScroll){
    col.scrollIntoView({behavior: "smooth", inline: "nearest", block: "nearest"});
    setTimeout(() => {
      const cuerpo = col.querySelector(".col-cuerpo");
      cuerpo.scrollTo({top: li.offsetTop - cuerpo.offsetTop - 4, behavior: "smooth"});
    }, 250);
  }
}

function cerrarPalabra(li){
  li.classList.remove("abierta");
  li.querySelector(".pal-detalle").innerHTML = "";
  marcarEnDescripcion();
}

// ---------- buscador ----------
// filtra las palabras de todas las letras (también por sus formas: «ligo» encuentra ligar)
const buscador = document.getElementById("buscar");
let colsAntesDeBuscar = null;   // qué letras estaban abiertas antes de empezar a buscar

const sinEnye = t => base(t).replace(/ñ/g, "n");   // «cono» también encuentra coño
function coincide(w, q){
  if(sinEnye(w).includes(q)) return true;
  return (CANON[w] || []).some(f => sinEnye(f).includes(q));
}
function aplicarBusqueda(){
  if(!buscador) return;
  const q = sinEnye(buscador.value.trim());
  const cols = [...tiras.querySelectorAll(".col")];
  if(!q){
    tiras.classList.remove("buscando");
    tiras.querySelectorAll(".no-coincide").forEach(x => x.classList.remove("no-coincide"));
    cols.forEach(c => c.classList.remove("sin-resultado"));
    if(colsAntesDeBuscar){
      cols.forEach(c => c.classList.toggle("abierta",
        colsAntesDeBuscar.has(c.dataset.letra) || !!c.querySelector(".pal.abierta")));
      colsAntesDeBuscar = null;
    }
    return [];
  }
  if(!colsAntesDeBuscar) colsAntesDeBuscar = new Set(cols.filter(c => c.classList.contains("abierta")).map(c => c.dataset.letra));
  tiras.classList.add("buscando");
  const encontradas = [];
  cols.forEach(c => {
    let hay = false;
    c.querySelectorAll(".pal").forEach(li => {
      const si = coincide(li.dataset.key, q);
      li.classList.toggle("no-coincide", !si);
      if(si){ hay = true; encontradas.push(li); }
    });
    c.classList.toggle("sin-resultado", !hay);
    c.classList.toggle("abierta", hay);
  });
  return encontradas;
}
buscador?.addEventListener("input", aplicarBusqueda);
buscador?.addEventListener("keydown", ev => {
  if(ev.key === "Enter"){
    const [primera] = aplicarBusqueda();
    if(primera) irAPalabra(primera.dataset.key);
  }
  if(ev.key === "Escape"){ buscador.value = ""; aplicarBusqueda(); }
});

// las palabras abiertas en el archivo se marcan también en la descripción
function marcarEnDescripcion(){
  const abiertas = new Set([...tiras.querySelectorAll(".pal.abierta")].map(x => x.dataset.key));
  document.querySelectorAll(".descripcion .w").forEach(w =>
    w.classList.toggle("active", abiertas.has(w.dataset.key)));
}

function palabraLi(palabra){
  const b = base(String(palabra));
  return [...tiras.querySelectorAll(".pal")].find(x => base(x.dataset.key) === b) || null;
}

function irAPalabra(palabra){
  const li = palabraLi(palabra);
  if(!li) return false;
  if(li.classList.contains("abierta")){
    const col = li.closest(".col");
    col.classList.add("abierta");
    col.scrollIntoView({behavior: "smooth", inline: "nearest", block: "nearest"});
    const cuerpo = col.querySelector(".col-cuerpo");
    cuerpo.scrollTo({top: li.offsetTop - cuerpo.offsetTop - 4, behavior: "smooth"});
  } else abrirPalabra(li);
  return true;
}

// al llegar desde el diccionario con index.html#palabra
function abrirDesdeDireccion(){
  const s = decodeURIComponent(location.hash.slice(1));
  if(!s) return;
  const li = [...tiras.querySelectorAll(".pal")].find(x => slugPalabra(x.dataset.key) === s);
  if(li && !li.classList.contains("abierta")) abrirPalabra(li);
}
window.addEventListener("hashchange", abrirDesdeDireccion);

// ---------- clics ----------
tiras.addEventListener("click", ev => {
  // palabra del glosario dentro de un mensaje: va a esa palabra
  const enMensaje = ev.target.closest(".msg-texto .w");
  if(enMensaje){ irAPalabra(enMensaje.dataset.key); return; }

  // remisión (→ rabo) en una definición: va a esa palabra sin salir del archivo
  const remite = ev.target.closest(".remite a");
  if(remite && /^(diccionario|terminos)\.html#/.test(remite.getAttribute("href"))){
    const id = remite.getAttribute("href").split("#")[1].replace(/-\d+$/, "");
    const e = [...ENTRADAS, ...(window.TERMINOS || [])].find(x => slug(x.termino) === id);
    if(e && irAPalabra(e.termino.split(",")[0].trim())) ev.preventDefault();
    return;
  }

  // palabra del índice: abre o cierra su detalle
  const link = ev.target.closest(".pal-link");
  if(link){
    ev.preventDefault();
    const li = link.closest(".pal");
    li.classList.contains("abierta") ? cerrarPalabra(li) : abrirPalabra(li);
    return;
  }

  // la letra: abre o cierra la columna
  const letra = ev.target.closest(".col-letra");
  if(letra){
    const col = letra.closest(".col");
    if(col.classList.contains("vacia")) return;
    col.classList.toggle("abierta");
    return;
  }

  // clic en una columna cerrada: la abre
  const col = ev.target.closest(".col");
  if(col && !col.classList.contains("abierta") && !col.classList.contains("vacia")) col.classList.add("abierta");
});

if(filtros) filtros.addEventListener("click", ev => {
  const b = ev.target.closest("button");
  if(!b) return;
  if(b.classList.contains("filtro-limpiar")){
    FILTRO_ANOS.clear(); FILTRO_DIR = null;
  } else if(b.dataset.ano){
    const y = Number(b.dataset.ano);
    FILTRO_ANOS.has(y) ? FILTRO_ANOS.delete(y) : FILTRO_ANOS.add(y);
  } else if(b.dataset.dir){
    FILTRO_DIR = FILTRO_DIR === b.dataset.dir ? null : b.dataset.dir;
  }
  filtros.querySelectorAll("[data-ano]").forEach(x => x.classList.toggle("active", FILTRO_ANOS.has(Number(x.dataset.ano))));
  filtros.querySelectorAll("[data-dir]").forEach(x => x.classList.toggle("active", FILTRO_DIR === x.dataset.dir));
  filtros.querySelector(".filtro-limpiar").hidden = !(FILTRO_ANOS.size || FILTRO_DIR);
  pintarTiras();
});

// «cerrar todo»
document.getElementById("cerrar-todas")?.addEventListener("click", () => {
  tiras.querySelectorAll(".pal.abierta").forEach(cerrarPalabra);
  tiras.querySelectorAll(".col.abierta").forEach(c => c.classList.remove("abierta"));
  RECORRIDO = [];   // también empieza el recorrido de cero
  pintarRecorrido();
  if(buscador){ buscador.value = ""; colsAntesDeBuscar = null; aplicarBusqueda(); }
});

// «Sex is Glitching» se guarda y se abre como las columnas
(function(){
  const lateral = document.querySelector(".lateral");
  const boton = document.getElementById("guardar-lateral");
  if(!lateral || !boton) return;
  lateral.addEventListener("click", ev => {
    const guardada = lateral.classList.contains("guardada");
    if(!guardada && !ev.target.closest("#guardar-lateral")) return;   // abierta: solo el título la guarda
    lateral.classList.toggle("guardada");
    boton.setAttribute("aria-expanded", String(guardada));
  });
})();

boot();