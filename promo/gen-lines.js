/* Génère les 8 lignes de narration via l'API ElevenLabs (fetch natif node).
   Usage : ELEVENLABS_API_KEY=... node gen-lines.js  — écrit lines/01..08.mp3.
   Fichier outil local ; la clé vient de l'environnement, jamais du code. */
const fs = require('fs');

const LINES = [
  ['01', 'It all starts with a simple scan.'],
  ['02', "That's how it works — just order in the chat, and I'll advise you."],
  ['03', 'Whoever walks in, I welcome them in their own language.'],
  ['04', 'And I know the whole menu by heart — photos, prices, everything.'],
  ['05', 'An allergy? One tap — and every unsafe dish is gone.'],
  ['06', 'You can even just talk to me. I understand.'],
  ['07', 'Beach club or hotel — one link, two jobs.'],
  ['08', 'This is Cieva — and this is only a demo. The real thing is still to come.'],
  ['09', "Every order lands straight in your kitchen — and you watch it all, live."],
  ['10', 'Bigger checks. Faster tables. Zero lost orders.'],
];
const VOICE = 'cgSgspJ2msm6clMCkdW9'; /* Jessica — chaleureuse, proche du personnage */
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ELEVENLABS_API_KEY manquante'); process.exit(1); }

(async () => {
  fs.mkdirSync('lines', { recursive: true });
  for (const [n, text] of LINES) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 } }),
    });
    if (!r.ok) { console.error(n, 'ERREUR', r.status, await r.text()); process.exit(1); }
    fs.writeFileSync(`lines/${n}.mp3`, Buffer.from(await r.arrayBuffer()));
    console.log(n, 'ok');
  }
})();