/* Assemble narration.mp3 à partir des lignes lines/01.mp3 … lines/08.mp3,
   posées aux offsets des scènes (silences ailleurs — ELLE parle pendant Hook et les clips).
   Usage : node make-narration.js  (nécessite ffmpeg dans le PATH) */
const { execSync } = require('child_process');
const fs = require('fs');

/* La narration est la voix d'ALINA (clonée depuis son clip) : première personne,
   elle enchaîne les écrans comme lorsqu'elle est à l'image. Silences pendant
   qu'elle parle en vidéo (Hook 3-13) et pendant Malee (29-39). */
const LINES = [
  ['01', 0.4,  'It all starts with a simple scan.'],
  ['02', 13.2, 'That was me — and this is how your guests order: right in the chat, straight to the kitchen.'],
  ['03', 19.3, 'Whoever walks in, I welcome them in their own language.'],
  ['04', 24.3, 'And I know the whole menu by heart — photos, prices, everything.'],
  ['05', 39.3, 'An allergy? One tap — and every unsafe dish is gone.'],
  ['06', 45.3, 'You can even just talk to me. I understand.'],
  ['07', 50.2, 'Beach club or hotel — one link, two jobs.'],
  ['08', 54.3, 'This is Cieva — and this is only a demo. The real thing is still to come.'],
];

const present = LINES.filter(([n]) => fs.existsSync(`lines/${n}.mp3`));
if (!present.length) { console.error('Aucune ligne dans lines/ — génère d’abord les mp3.'); process.exit(1); }
const inputs = present.map(([n]) => `-i lines/${n}.mp3`).join(' ');
const delays = present.map(([, off], i) => `[${i}:a]adelay=${Math.round(off*1000)}|${Math.round(off*1000)}[a${i}]`).join(';');
const mix = present.map((_, i) => `[a${i}]`).join('');
const cmd = `ffmpeg -y -v error ${inputs} -filter_complex "${delays};${mix}amix=inputs=${present.length}:normalize=0,apad=whole_dur=58[out]" -map "[out]" -t 58 narration.mp3`;
execSync(cmd, { stdio: 'inherit' });
console.log('narration.mp3 OK (' + present.length + '/8 lignes)');