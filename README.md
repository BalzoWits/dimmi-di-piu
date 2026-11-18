# Dimmi di più · Tell Me More

Gioco di carte per parlarsi davvero, da telefono o PC, in italiano e in inglese.

- 5 mazzi (Conoscersi, Tra amici, Self Love, XXX 18+, HOT 18+), 3 livelli da 60 carte: 900 carte.
- Tipi di carta: domanda, completa la frase, rispondete entrambi / tutti, azione o sfida, jolly.
- Ogni carta ha le due lingue: cambiando lingua la carta in mano resta la stessa.
- Partita salvata nel browser (localStorage): si riprende da dove si era rimasti.
- Telefono: tocca la carta o scorri (sinistra = prossima, destra = precedente).
- PC: spazio / → prossima, ← precedente, 1-2-3 livello, Esc torna ai mazzi.

## File
- `decks/<mazzo>.json`: le carte, `{"1":[{"k":"q","it":"…","en":"…"}],"2":[…],"3":[…]}`. Si modificano qui.
  `k`: `q` domanda, `fill` completa la frase, `all` rispondono entrambi/tutti, `do` azione/sfida, `wild` jolly.
- `node build-decks.js`: controlla le carte (lingue, tipi, doppioni) e rigenera `js/decks.js`.
- `publish.ps1 "messaggio"`: pubblica su GitHub via API (git push dalla rete aziendale fallisce per SSL).
- `_orig/`: la vecchia versione WRNRS e i vecchi mazzi (non pubblicati).
