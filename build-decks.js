// Unisce decks/<mazzo>.json in js/decks.js (caricato con <script>, funziona anche aprendo il file in locale)
// e controlla che ogni carta sia completa e non ci siano doppioni.
// Uso: node build-decks.js
const fs = require('fs');
const path = require('path');
const MODES = ['standard', 'friends', 'selflove', 'xxx', 'hot'];
const KINDS = ['q', 'fill', 'all', 'do', 'wild'];
const out = {};
const seen = new Map();
let errors = 0;
const err = m => { errors++; console.error(m); };
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

for (const m of MODES) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'decks', `${m}.json`), 'utf8'));
  out[m] = {};
  for (const l of ['1', '2', '3']) {
    const list = d[l] || [];
    out[m][l] = list.map(({ k, it, en }) => ({ k, it, en }));
    const kinds = {};
    list.forEach((c, i) => {
      const where = `${m} L${l} #${i + 1}`;
      if (!KINDS.includes(c.k)) err(`${where}: tipo "${c.k}" sconosciuto`);
      if (!c.it || !c.en) err(`${where}: manca una lingua`);
      kinds[c.k] = (kinds[c.k] || 0) + 1;
      for (const lang of ['it', 'en']) {
        const key = lang + ':' + norm(c[lang] || '');
        if (seen.has(key)) err(`${where}: doppione di ${seen.get(key)} (${lang})`);
        else seen.set(key, where);
      }
    });
    console.log(`${m.padEnd(9)} L${l}: ${String(list.length).padStart(3)} carte`, JSON.stringify(kinds));
  }
}
if (errors) { console.error(`${errors} errori: js/decks.js non aggiornato`); process.exit(1); }
fs.writeFileSync(path.join(__dirname, 'js', 'decks.js'),
  '// generato da build-decks.js: non modificare a mano, modificare decks/*.json\nwindow.DECKS = ' + JSON.stringify(out) + ';\n');
console.log('js/decks.js scritto');
