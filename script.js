const LS_KEY = "diccionario_entries_override";

let CANON = null;      // se carga desde data.json
let ENTRIES = null;    // lista activa (default o subida por CSV)

function escapeHtml(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function tagsForText(text){
  const t = " " + text.toLowerCase() + " ";
  const found = [];
  for(const canon in CANON){
    if(canon === "intimo") continue;
    for(const form of CANON[canon]){
      if(form === "___never___") continue;
      if(t.includes(form.toLowerCase())){ found.push(canon); break; }
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
    tags: tagsForText(text),
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

// ---------- render ----------
const cloud = document.getElementById("cloud");

function makeGroup(title){
  const sec = document.createElement("section");
  sec.className = "grupo";
  sec.innerHTML = `<div class="grupo-items"></div>`;
  cloud.appendChild(sec);
  return sec.querySelector(".grupo-items");
}

function makeBadge(cls, type, key, label, count){
  const span = document.createElement("span");
  span.className = cls;
  span.dataset.type = type;
  span.dataset.key = key;
  span.textContent = String(label);
  return span;
}

// ---------- unión con el diccionario ----------
// misma forma de escribir las direcciones que en el diccionario: «coño» -> «cono»
function slugPalabra(s){
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

// palabras que tienen entrada en el diccionario (diccionario-data.js)
const EN_DICCIONARIO = new Set(
  (typeof DICCIONARIO !== "undefined" ? DICCIONARIO : []).map(e => slugPalabra(e.termino))
);

function enlaceDiccionario(palabra){
  const s = slugPalabra(palabra);
  if(!EN_DICCIONARIO.has(s)) return "";
  return ` <span class="remite">(→ <a href="diccionario.html#${s}">diccionario</a>)</span>`;
}

// al llegar desde el diccionario con archive.html#palabra, abre esa palabra
function abrirDesdeDireccion(){
  const s = decodeURIComponent(location.hash.slice(1));
  if(!s) return;
  const el = [...cloud.querySelectorAll('.grupo-items > [data-type="word"]')]
    .find(x => slugPalabra(x.dataset.key) === s);
  if(el && openTrigger !== el) openBucket("word", el.dataset.key, el);
}
window.addEventListener("hashchange", abrirDesdeDireccion);

function renderCloud(){
  cloud.innerHTML = "";
  openResults = null;
  openTrigger = null;

  const yearCount = {};
  const wordCount = {};
  const dirCount = {to_me:0, by_me:0};
  ENTRIES.forEach(e=>{
    yearCount[e.year] = (yearCount[e.year]||0) + 1;
    e.tags.forEach(t=>{ wordCount[t] = (wordCount[t]||0) + 1; });
    dirCount[e.direction]++;
  });

  const years = Object.keys(yearCount).map(Number).sort((a,b)=>a-b);
  const words = Object.keys(wordCount).filter(w=>w!=="intimo").sort((a,b)=>a.localeCompare(b,"es"));

  // todo junto en una sola nube: años, palabras y dirección
  const g = makeGroup("");
  years.forEach(y=> g.appendChild(makeBadge("d", "year", y, y, yearCount[y])));
  words.forEach(w=> g.appendChild(makeBadge("w", "word", w, w, wordCount[w])));
  [["to_me","sent to me"],["by_me","sent by me"]].forEach(([k,l])=>{
    g.appendChild(makeBadge("n", "direction", k, l, dirCount[k]));
  });

  abrirDesdeDireccion();
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

let openResults = null;
let openTrigger = null;

function closeResults(){
  if(openResults){ openResults.remove(); openResults = null; }
  if(openTrigger){ openTrigger.classList.remove("active"); openTrigger = null; }
}

function openBucket(type, key, anchorEl){
  const topBadge = document.querySelector(`#cloud .grupo-items > [data-type="${type}"][data-key="${CSS.escape(String(key))}"]`);
  const useAnchor = topBadge || anchorEl;

  // volver a pulsar la misma etiqueta la cierra
  if(openTrigger === useAnchor){ closeResults(); return; }
  closeResults();

  useAnchor.classList.add("active");
  openTrigger = useAnchor;

  let matches;
  let label;
  if(type==="year"){
    matches = ENTRIES.filter(e => e.year === Number(key));
    label = String(key);
  } else if(type==="direction"){
    matches = ENTRIES.filter(e => e.direction === key);
    label = key === "by_me" ? "sent by me" : "sent to me";
  } else {
    matches = ENTRIES.filter(e => e.tags.includes(key));
    label = String(key);
  }
  matches.sort((a,b)=>(a.year*100+a.month)-(b.year*100+b.month));

  const box = document.createElement("div");
  box.className = "results";
  const enDicc = type === "word" ? enlaceDiccionario(key) : "";
  let html = `<div class="rlabel"><span>${escapeHtml(label)} · ${matches.length} mensaje${matches.length===1?"":"s"}${enDicc}</span><button class="cerrar" type="button" aria-label="cerrar">×</button></div>`;
  matches.forEach(m=>{
    const dirLabel = m.direction === "by_me" ? "sent by me" : "sent to me";
    html += `<div class="qblock">
      <div class="qmeta"><span class="d" data-type="year" data-key="${m.year}">${escapeHtml(m.fecha_larga)}</span><span class="n" data-type="direction" data-key="${m.direction}">${dirLabel}</span></div>
      <div class="qtext">${highlightAll(m.text)}</div>
    </div>`;
  });
  box.innerHTML = html;

  // los resultados aparecen debajo del grupo, sin romper la fila de etiquetas
  const grupo = useAnchor.closest(".grupo");
  (grupo || useAnchor).insertAdjacentElement("afterend", box);
  openResults = box;
  box.scrollIntoView({behavior:"smooth", block:"nearest"});
}

cloud.addEventListener("click", (ev)=>{
  if(ev.target.closest(".cerrar")){ closeResults(); return; }
  const el = ev.target.closest("[data-type]");
  if(!el) return;
  openBucket(el.dataset.type, el.dataset.key, el);
});

boot();