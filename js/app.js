/* Dimmi di più · Tell Me More
   I mazzi stanno in js/decks.js, generato da build-decks.js:
   window.DECKS[mazzo][livello] = [{ k: tipo, it: testo, en: testo }]
   Ogni carta ha entrambe le lingue: cambiando lingua la carta in mano resta la stessa. */
(() => {
  'use strict';

  const MODES = [
    { id: 'standard', adult: false, color: '#c8233c' },
    { id: 'friends', adult: false, color: '#e04f62' },
    { id: 'selflove', adult: false, color: '#d4628a' },
    { id: 'xxx', adult: true, color: '#8f1734' },
    { id: 'hot', adult: true, color: '#e3263f' },
  ];

  const T = {
    it: {
      brand: 'Dimmi di più',
      docTitle: 'Dimmi di più · Un gioco di carte',
      eyebrow: 'Un gioco di carte per parlarsi davvero',
      title: 'Dimmi di <em>più</em>.',
      lead: 'Scegli un mazzo, mettete il telefono al centro e pescate a turno. Tre livelli, dal leggero al senza filtri.',
      foot: 'I mazzi 18+ sono pensati per coppie e adulti consenzienti. Una carta si può sempre saltare.',
      back: 'Indietro', prev: 'Carta precedente', next: 'Carta successiva',
      shuffle: 'Rimescola', draw: 'Pesca', drawNext: 'Prossima carta',
      level: 'Livello', cards: 'carte',
      levels: ['Leggero', 'Profondo', 'Senza filtri'],
      modes: {
        standard: ['Conoscersi', 'Per due persone che vogliono scoprirsi.'],
        friends: ['Tra amici', 'Per il gruppo: risate, ricordi, verità.'],
        selflove: ['Self Love', 'Un dialogo sincero con te.'],
        xxx: ['XXX', 'Il desiderio, detto a parole.'],
        hot: ['HOT', 'Sfide e domande per due.'],
      },
      kinds: { q: 'Domanda', fill: 'Completa la frase', all2: 'Entrambi', all: 'Tutti', do: 'Azione', dare: 'Sfida', wild: 'Jolly' },
      tapToStart: 'Tocca per pescare',
      endTitle: 'Mazzo finito',
      endText: 'Avete pescato tutte le carte di questo livello.',
      again: 'Rimescola e ricomincia', nextLevel: 'Passa al livello',
      hintTouch: 'scorri o tocca', hintKeys: 'spazio · ← →',
      confirmShuffle: 'Rimescolare il mazzo di questo livello?',
    },
    en: {
      brand: 'Tell Me More',
      docTitle: 'Tell Me More · A card game',
      eyebrow: 'A card game for real conversations',
      title: 'Tell me <em>more</em>.',
      lead: 'Pick a deck, put the phone between you and take turns drawing. Three levels, from light to unfiltered.',
      foot: '18+ decks are meant for couples and consenting adults. You can always skip a card.',
      back: 'Back', prev: 'Previous card', next: 'Next card',
      shuffle: 'Shuffle', draw: 'Draw', drawNext: 'Next card',
      level: 'Level', cards: 'cards',
      levels: ['Light', 'Deeper', 'Unfiltered'],
      modes: {
        standard: ['Getting Closer', 'For two people who want to know each other.'],
        friends: ['Among Friends', 'For the group: laughs, memories, truths.'],
        selflove: ['Self Love', 'An honest conversation with yourself.'],
        xxx: ['XXX', 'Desire, put into words.'],
        hot: ['HOT', 'Dares and questions for two.'],
      },
      kinds: { q: 'Question', fill: 'Finish the sentence', all2: 'Both of you', all: 'Everyone', do: 'Try this', dare: 'Dare', wild: 'Wild card' },
      tapToStart: 'Tap to draw',
      endTitle: 'Deck finished',
      endText: "You've drawn every card in this level.",
      again: 'Shuffle and restart', nextLevel: 'Go to level',
      hintTouch: 'swipe or tap', hintKeys: 'space · ← →',
      confirmShuffle: 'Shuffle this level again?',
    },
  };

  const $ = id => document.getElementById(id);
  const KEY = 'dimmi-di-piu-v1';
  const store = {
    load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage non disponibile */ } },
  };

  const saved = store.load();
  const S = {
    lang: saved.lang || ((navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en'),
    mode: null,
    level: 1,
    games: saved.games || {},   // games[mode][level] = { order: [...], pos, view }
    lastLevel: saved.lastLevel || {},
  };
  const persist = () => store.save({ lang: S.lang, games: S.games, lastLevel: S.lastLevel });
  const t = () => T[S.lang];
  const cards = () => DECKS[S.mode][S.level];
  const touchy = matchMedia('(hover: none)').matches;

  const shuffled = n => {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  function game() {
    const n = cards().length;
    S.games[S.mode] ??= {};
    let g = S.games[S.mode][S.level];
    if (!g || g.order.length !== n) g = S.games[S.mode][S.level] = { order: shuffled(n), pos: 0, view: -1 };
    return g;
  }

  /* ---------- testi ---------- */
  function applyLang() {
    document.documentElement.lang = S.lang;
    document.title = t().docTitle;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t()[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t()[el.dataset.i18nAria]));
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === S.lang));
    renderDecks();
    if (S.mode) { renderHead(); renderLevels(); showCard(0); }
  }

  function renderDecks() {
    $('decks').innerHTML = MODES.map((m, i) => {
      const [name, desc] = t().modes[m.id];
      const n = [1, 2, 3].reduce((s, l) => s + DECKS[m.id][l].length, 0);
      return `<button class="deck" data-mode="${m.id}" style="--c:${m.color};--i:${i}">
        <span class="mini" aria-hidden="true"><i></i><i></i></span>
        <span class="meta">${m.adult ? '<span class="badge">18+</span>' : ''}<span>${n} ${t().cards}</span></span>
        <h3>${name}</h3><p>${desc}</p></button>`;
    }).join('');
  }

  function renderHead() {
    const [name, desc] = t().modes[S.mode];
    $('game-title').textContent = name;
    $('game-sub').textContent = desc;
  }
  function renderLevels() {
    $('levels').innerHTML = [1, 2, 3].map(l =>
      `<button role="tab" data-level="${l}" aria-selected="${l === S.level}"><b>${t().level} ${l}</b><span>${t().levels[l - 1]}</span></button>`).join('');
  }

  /* ---------- carte ---------- */
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function kindLabel(k) {
    const K = t().kinds;
    if (k === 'all') return S.mode === 'friends' ? K.all : K.all2;
    if (k === 'do') return S.mode === 'hot' ? K.dare : K.do;
    return K[k] || K.q;
  }
  function cardEl() {
    const g = game();
    const el = document.createElement('div');
    if (g.view < 0) {
      el.className = 'card intro';
      el.innerHTML = `<div class="big">${t().title}</div><p>${t().tapToStart}</p>`;
    } else if (g.view >= g.order.length) {
      el.className = 'card end';
      const acts = [`<button class="primary" data-act="again">${t().again}</button>`];
      if (S.level < 3) acts.push(`<button data-act="level">${t().nextLevel} ${S.level + 1}</button>`);
      el.innerHTML = `<h3>${t().endTitle}</h3><p>${t().endText}</p><div class="acts">${acts.join('')}</div>`;
    } else {
      const c = cards()[g.order[g.view]];
      const q = c[S.lang];
      el.className = `card k-${c.k}`;
      el.innerHTML = `<div class="top"><span class="lvl">${t().level} ${S.level}</span><span class="kind">${kindLabel(c.k)}</span></div>
        <p class="q${q.length > 90 ? ' long' : ''}">${esc(q)}</p>
        <div class="bottom"><span class="w">${t().brand}</span><span>${g.view + 1} / ${g.order.length}</span></div>`;
    }
    return el;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // dir: 1 = carta nuova dal mazzo, -1 = torna alla precedente, 0 = sostituisci senza animazione
  function showCard(dir) {
    const stage = $('stage');
    const old = stage.querySelector('.card:not(.leaving)');
    const el = cardEl();
    stage.appendChild(el);
    if (old) {
      if (dir === 0 || reduced) old.remove();
      else {
        old.classList.add('leaving');
        old.animate([{ transform: 'none', opacity: 1 },
          { transform: `translateX(${dir * -120}%) rotate(${dir * -14}deg)`, opacity: 0 }],
          { duration: 380, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => old.remove();
      }
    }
    if (dir === 1 && !reduced) {
      el.animate([{ transform: 'translateY(4%) rotateY(-180deg) scale(.96)', filter: 'brightness(.85)' },
        { transform: 'none', filter: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else if (dir === -1 && !reduced) {
      el.animate([{ transform: 'translateX(-110%) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    updateUi();
  }

  function updateUi() {
    const g = game();
    const n = g.order.length;
    const shown = Math.min(Math.max(g.view + 1, 0), n);
    $('count').textContent = `${shown} / ${n}`;
    $('bar').style.width = `${(g.pos / n) * 100}%`;
    $('prev').disabled = g.view <= 0;
    $('next-side').disabled = g.view >= n;
    $('draw').disabled = g.view >= n;
    $('draw').firstElementChild.textContent = g.view < 0 ? t().draw : t().drawNext;
    $('stage').classList.toggle('empty', g.pos >= n);
    $('hint').textContent = touchy ? t().hintTouch : t().hintKeys;
  }

  function next() {
    const g = game();
    if (g.view >= g.order.length) return;
    g.view++;
    if (g.view > g.pos - 1) g.pos = Math.min(g.view + 1, g.order.length);
    persist();
    showCard(1);
  }
  function prev() {
    const g = game();
    if (g.view <= 0) return;
    g.view = Math.min(g.view, g.order.length) - 1;
    persist();
    showCard(-1);
  }
  function reshuffle() {
    S.games[S.mode][S.level] = { order: shuffled(cards().length), pos: 0, view: -1 };
    persist();
    showCard(1);
  }
  function setLevel(l) {
    if (l === S.level) return;
    S.level = l;
    S.lastLevel[S.mode] = l;
    persist();
    renderLevels(); showCard(1);
  }

  /* ---------- navigazione ---------- */
  // aperta da qui: "indietro" torna nella cronologia; arrivati da un link diretto: si va alla home senza uscire
  let pushed = false;
  const leave = () => (pushed ? history.back() : goHome());
  function openMode(mode, push = true) {
    S.mode = mode;
    S.level = S.lastLevel[mode] || 1;
    document.body.dataset.mode = mode;
    document.body.dataset.screen = 'game';
    if (push) { try { history.pushState({ mode }, '', `#${mode}`); pushed = true; } catch { /* es. file:// */ } }
    renderHead(); renderLevels();
    $('stage').querySelectorAll('.card').forEach(c => c.remove());
    showCard(1);
    window.scrollTo(0, 0);
  }
  function goHome(push = true) {
    S.mode = null;
    document.body.dataset.screen = 'home';
    delete document.body.dataset.mode;
    if (push) try { history.pushState({}, '', location.pathname); } catch { /* es. file:// */ }
    pushed = false;
  }

  $('decks').addEventListener('click', e => { const b = e.target.closest('.deck'); if (b) openMode(b.dataset.mode); });
  $('back').addEventListener('click', () => leave());
  $('brand').addEventListener('click', e => { e.preventDefault(); if (S.mode) leave(); });
  window.addEventListener('popstate', () => {
    const m = location.hash.slice(1);
    if (MODES.some(x => x.id === m)) openMode(m, false); else goHome(false);
  });
  document.querySelector('.lang').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.lang === S.lang) return;
    S.lang = b.dataset.lang; persist(); applyLang();
  });
  $('levels').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLevel(+b.dataset.level); });
  $('draw').addEventListener('click', next);
  $('next-side').addEventListener('click', next);
  $('prev').addEventListener('click', prev);
  $('shuffle').addEventListener('click', () => { if (game().pos === 0 || confirm(t().confirmShuffle)) reshuffle(); });

  // tocco / trascinamento sulla carta: tap = prossima, swipe a sinistra = prossima, a destra = precedente
  const stage = $('stage');
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    const card = e.target.closest('.card:not(.leaving)');
    if (!card || e.target.closest('button') || e.button > 0) return;
    drag = { card, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId };
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x;
    if (Math.abs(drag.dx) > 8 && Math.abs(drag.dx) > Math.abs(e.clientY - drag.y)) {
      if (!drag.captured) { stage.setPointerCapture(e.pointerId); drag.captured = true; }
      drag.card.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx / 22}deg)`;
    }
  });
  stage.addEventListener('pointerup', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const { card, dx, captured } = drag; drag = null;
    const g = game();
    if (!captured) { if (!card.classList.contains('end')) next(); return; }
    if (dx < -70 && g.view < g.order.length) { card.style.transform = ''; next(); }
    else if (dx > 70 && g.view > 0) { card.style.transform = ''; prev(); }
    else card.animate([{ transform: card.style.transform }, { transform: 'none' }], { duration: 250, easing: 'ease-out' })
      .onfinish = () => { card.style.transform = ''; };
  });
  stage.addEventListener('pointercancel', () => { if (drag) { drag.card.style.transform = ''; drag = null; } });
  stage.addEventListener('click', e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    if (b.dataset.act === 'again') reshuffle(); else setLevel(S.level + 1);
  });

  document.addEventListener('keydown', e => {
    if (!S.mode || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
      if (e.target.closest('button') && e.key !== 'ArrowRight') return;
      e.preventDefault(); next();
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (['1', '2', '3'].includes(e.key)) setLevel(+e.key);
    else if (e.key === 'Escape') leave();
  });

  /* ---------- avvio ---------- */
  applyLang();
  const start = location.hash.slice(1);
  if (MODES.some(x => x.id === start)) openMode(start, false);
})();
