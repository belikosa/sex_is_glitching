// Código común de los diccionarios (diccionario.html y terminos.html).
// Cada página carga antes su propio archivo de datos, que define DICCIONARIO.
const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
// quita tildes pero conserva la ñ
function base(s){
  return s.toLowerCase().replace(/ñ/g,"\u0001").normalize("NFD")
    .replace(/[̀-ͯ]/g,"").replace(/\u0001/g,"ñ");
}
function slug(s){
  return base(s).replace(/ñ/g,"n").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function letraDe(s){
  const c = base(s).charAt(0).toUpperCase();
  return ABC.includes(c) ? c : "#";
}

const ENTRADAS = [...DICCIONARIO].sort((a,b) =>
  a.termino.localeCompare(b.termino, "es", {sensitivity:"base"}));

const PORNOMBRE = {};
ENTRADAS.forEach(e => {
  PORNOMBRE[base(e.termino)] = e;
  PORNOMBRE[base(e.termino.split(",")[0].trim())] ||= e;   // «chochólogo, -a, -e» -> «chochólogo»
});

// «vaginismo#2» -> enlace a la acepción 2 de vaginismo
function remision(ref){
  const [t, n] = ref.trim().split("#");
  const dest = PORNOMBRE[base(t)];
  const texto = esc(t) + (n ? ", " + esc(n) : "");
  if(!dest) return texto;
  const href = "#" + slug(dest.termino) + (n ? "-" + n : "");
  return `<a href="${href}">${texto}</a>`;
}

// «(Ver rabo)» dentro de una definición -> «(→ rabo)» con enlace
function definicion(d){
  return esc(d).replace(/\(Ver ([^)]+)\)/g, (m, t) => {
    // «vaginismo, 2» -> una sola remisión a la acepción 2
    const refs = [];
    t.split(",").map(x => x.trim()).forEach(x => {
      if(/^\d+$/.test(x) && refs.length) refs[refs.length-1] += "#" + x;
      else refs.push(x);
    });
    return `<span class="remite">(→ ${refs.map(remision).join(", ")})</span>`;
  });
}

function entrada(e){
  const id = slug(e.termino);
  const acep = e.acepciones.map(a => `
    <li${a.num ? ` id="${id}-${a.num}"` : ""}>
      ${a.num ? `<span class="num">${esc(a.num)}.</span>` : ""}
      <span class="cat">${esc(a.cat)}</span>
      <span class="def">${definicion(a.def)}</span>
      ${a.ej ? `<span class="ej">${esc(a.ej)}</span>` : ""}
    </li>`).join("");
  const ver = e.ver.length
    ? `<p class="dic-ver"><span class="remite">(→ ${e.ver.map(remision).join(", ")})</span></p>` : "";
  const nota = e.nota ? `<p class="dic-nota">${esc(e.nota)}</p>` : "";
  const busca = base([e.termino, ...e.acepciones.map(a => a.def + " " + a.ej)].join(" "));
  return `<article class="dic-entrada" id="${id}" data-busca="${esc(busca)}">
      <div class="dic-lema">
        <a class="w" href="#${id}">${esc(e.termino)}</a>
        ${e.origen ? `<span class="origen">${esc(e.origen)}</span>` : ""}
      </div>
      <ol class="acepciones">${acep}</ol>
      ${ver}${nota}
    </article>`;
}

const porLetra = {};
ENTRADAS.forEach(e => { (porLetra[letraDe(e.termino)] ||= []).push(e); });

document.getElementById("diccionario").innerHTML = Object.keys(porLetra)
  .sort((a,b) => ABC.indexOf(a) - ABC.indexOf(b))
  .map(L => `<section class="dic-letra" id="letra-${L}">${porLetra[L].map(entrada).join("")}</section>`)
  .join("");

const nav = document.getElementById("letras");
if(nav) nav.innerHTML = ABC.map(L =>
  porLetra[L]
    ? `<a class="letra" href="#letra-${L}">${L}</a>`
    : `<span class="letra vacia">${L}</span>`
).join("");

// buscador: términos, definiciones y ejemplos
const buscar = document.getElementById("buscar");
const vacio = document.getElementById("vacio");
if(buscar) buscar.addEventListener("input", () => {
  const q = base(buscar.value.trim());
  let visibles = 0;
  document.querySelectorAll(".dic-letra").forEach(sec => {
    let enSec = 0;
    sec.querySelectorAll(".dic-entrada").forEach(a => {
      const ok = !q || a.dataset.busca.includes(q);
      a.hidden = !ok;
      if(ok) enSec++;
    });
    sec.hidden = enSec === 0;
    visibles += enSec;
  });
  vacio.hidden = visibles !== 0;
});

window.addEventListener("hashchange", () => {
  if(buscar && buscar.value){ buscar.value = ""; buscar.dispatchEvent(new Event("input")); }
});
