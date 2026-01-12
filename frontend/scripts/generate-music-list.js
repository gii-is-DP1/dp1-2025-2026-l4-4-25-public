const fs = require('fs');
const path = require('path');

// Script: scans frontend/public/music and generates list.json
// Usage: node scripts/generate-music-list.js

const musicDir = path.join(__dirname, '..', 'public', 'music');
const outFile = path.join(musicDir, 'list.json');

function titleFromFilename(name) {
  return name.replace(/[-_]/g, ' ').replace(/\.(mp3|ogg|wav|m4a|flac)$/i, '');
}

try {
  const files = fs.readdirSync(musicDir).filter(f => /\.(mp3|ogg|wav|m4a|flac)$/i.test(f));
  // Try to preserve existing metadata if present
  let existing = { tracks: [] };
  try {
    const raw = fs.readFileSync(outFile, 'utf8');
    existing = JSON.parse(raw);
  } catch (e) {}

  const existingMap = new Map((existing.tracks || []).map(t => [t.file, t]));

  const tracks = files.map(f => {
    const prev = existingMap.get(f) || {};
    return {
      file: f,
      title: prev.title || titleFromFilename(f),
      default: !!prev.default,
      author: prev.author || null,
      source: prev.source || null,
      credit: prev.credit || null
    };
  });

  // If no explicit default, mark first as default
  if (!tracks.some(t => t.default)) {
    if (tracks[0]) tracks[0].default = true;
  }

  const out = { tracks };
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
  console.log('Generated', outFile);
} catch (err) {
  console.error('Error generating music list:', err.message || err);
  process.exit(1);
}
