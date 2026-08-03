/* Assemble narration.mp3 à partir des lignes lines/01.mp3 … lines/08.mp3,
   posées aux offsets des scènes (silences ailleurs — ELLE parle pendant Hook et les clips).
   Usage : node make-narration.js  (nécessite ffmpeg dans le PATH) */
const { execSync } = require('child_process');
const fs = require('fs');

const LINES = [
  ['01', 0.5,  'It all starts with a simple scan.'],
  ['02', 13.3, 'Your guests order in the chat — and it goes straight to the kitchen.'],
  ['03', 19.3, 'She welcomes every guest in their own language.'],
  ['04', 24.3, 'She knows the whole menu — photos, prices, everything.'],
  ['05', 37.3, 'One allergy? One tap — and every unsafe dish disappears.'],
  ['06', 43.3, 'Or just talk to her. She understands.'],
  ['07', 48.2, 'Beach club or hotel — one link, two jobs.'],
  ['08', 58.3, 'Cieva.'],
];

const present = LINES.filter(([n]) => fs.existsSync(`lines/${n}.mp3`));
if (!present.length) { console.error('Aucune ligne dans lines/ — génère d’abord les mp3.'); process.exit(1); }
const inputs = present.map(([n]) => `-i lines/${n}.mp3`).join(' ');
const delays = present.map(([, off], i) => `[${i}:a]adelay=${Math.round(off*1000)}|${Math.round(off*1000)}[a${i}]`).join(';');
const mix = present.map((_, i) => `[a${i}]`).join('');
const cmd = `ffmpeg -y -v error ${inputs} -filter_complex "${delays};${mix}amix=inputs=${present.length}:normalize=0,apad=whole_dur=60[out]" -map "[out]" -t 60 narration.mp3`;
execSync(cmd, { stdio: 'inherit' });
console.log('narration.mp3 OK (' + present.length + '/8 lignes)');