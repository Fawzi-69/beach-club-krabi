/* Regénère UNE ligne : ELEVENLABS_API_KEY=... node gen-one.js 02 */
const fs = require('fs');
const { execSync } = require('child_process');
const n = process.argv[2];
const src = fs.readFileSync('gen-lines.js', 'utf8');
const m = src.match(new RegExp(`\\['${n}',\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`));
if (!m) { console.error('ligne', n, 'introuvable'); process.exit(1); }
const text = m[2];
const VOICE = 'cgSgspJ2msm6clMCkdW9';
const KEY = process.env.ELEVENLABS_API_KEY;
(async () => {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 } }),
  });
  if (!r.ok) { console.error('ERREUR', r.status, await r.text()); process.exit(1); }
  fs.writeFileSync(`lines/${n}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log(n, 'ok:', text);
})();