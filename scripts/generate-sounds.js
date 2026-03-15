// Generate WAV sound files for DebtPath sound events
// Duolingo-style: warm, bright chimes (sine = marimba-like), short attack, soft decay
// Run: node scripts/generate-sounds.js
// Outputs WAV files to assets/sounds/

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050;
const CHANNELS = 1;
const BIT_DEPTH = 16;

const NOTE_HZ = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784.0, A5: 880.0,
  C6: 1046.50, Eb5: 622.25,
};

function hz(note) {
  return NOTE_HZ[note] ?? 440;
}

// Generate PCM float samples for a mix of tones
function renderSamples(totalSecs, tones) {
  const n = Math.ceil(SAMPLE_RATE * totalSecs);
  const buf = new Float32Array(n);

  for (const { note, freq, start, dur, peak, shape = "sine" } of tones) {
    const f = freq ?? hz(note);
    const s0 = Math.floor(start * SAMPLE_RATE);
    const sN = Math.floor(dur * SAMPLE_RATE);
    const attackN = Math.floor(0.022 * SAMPLE_RATE);

    for (let i = 0; i < sN; i++) {
      if (s0 + i >= n) break;
      const t = i / SAMPLE_RATE;

      // Envelope: soft attack + warm decay (Duolingo-style)
      let env;
      if (i < attackN) {
        env = peak * (i / attackN);
      } else {
        const dt = (i - attackN) / SAMPLE_RATE;
        env = peak * Math.exp(-dt * 4.2);
      }

      // Wave shape
      let wave;
      if (shape === "sine") {
        wave = Math.sin(2 * Math.PI * f * t);
      } else if (shape === "triangle") {
        const ph = (f * t) % 1;
        wave = ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph;
      } else {
        wave = Math.sin(2 * Math.PI * f * t);
      }

      buf[s0 + i] += env * wave;
    }
  }

  // Normalize
  let peak = 0;
  for (let i = 0; i < buf.length; i++) if (Math.abs(buf[i]) > peak) peak = Math.abs(buf[i]);
  if (peak > 0.88) for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / peak) * 0.88;

  return buf;
}

function floatToWav(samples) {
  const dataSize = samples.length * 2;
  const b = Buffer.alloc(44 + dataSize);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + dataSize, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);                          // PCM
  b.writeUInt16LE(CHANNELS, 22);
  b.writeUInt32LE(SAMPLE_RATE, 24);
  b.writeUInt32LE(SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8), 28);
  b.writeUInt16LE(CHANNELS * (BIT_DEPTH / 8), 32);
  b.writeUInt16LE(BIT_DEPTH, 34);
  b.write("data", 36);
  b.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    b.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7fff, 44 + i * 2);
  }
  return b;
}

// ── Duolingo-style: warm chimes (sine), 2-note ascending, soft decay ─────────
const SOUNDS = {
  payment_logged: {
    dur: 0.36,
    tones: [
      { note: "C5", start: 0.00, dur: 0.28, peak: 0.72, shape: "sine" },
      { note: "E5", start: 0.06, dur: 0.26, peak: 0.65, shape: "sine" },
    ],
  },
  xp_earned: {
    dur: 0.28,
    tones: [
      { note: "E5", start: 0.00, dur: 0.12, peak: 0.78, shape: "sine" },
      { note: "G5", start: 0.04, dur: 0.20, peak: 0.68, shape: "sine" },
    ],
  },
  streak_maintained: {
    dur: 0.48,
    tones: [
      { note: "G4", start: 0.00, dur: 0.22, peak: 0.68, shape: "sine" },
      { note: "C5", start: 0.10, dur: 0.34, peak: 0.68, shape: "sine" },
    ],
  },
  level_up: {
    dur: 0.82,
    tones: [
      { note: "C5", start: 0.00, dur: 0.22, peak: 0.70, shape: "sine" },
      { note: "E5", start: 0.18, dur: 0.22, peak: 0.70, shape: "sine" },
      { note: "G5", start: 0.36, dur: 0.40, peak: 0.76, shape: "sine" },
    ],
  },
  milestone: {
    dur: 1.15,
    tones: [
      { note: "C5", start: 0.00, dur: 0.18, peak: 0.68, shape: "sine" },
      { note: "E5", start: 0.14, dur: 0.18, peak: 0.68, shape: "sine" },
      { note: "G5", start: 0.28, dur: 0.20, peak: 0.72, shape: "sine" },
      { note: "C6", start: 0.48, dur: 0.60, peak: 0.78, shape: "sine" },
    ],
  },
  streak_at_risk: {
    dur: 0.40,
    tones: [
      { note: "E5",  start: 0.00, dur: 0.18, peak: 0.58, shape: "sine" },
      { note: "Eb5", start: 0.12, dur: 0.24, peak: 0.52, shape: "sine" },
    ],
  },
  variable_bonus: {
    dur: 0.32,
    tones: [
      { note: "G5", start: 0.00, dur: 0.08, peak: 0.70, shape: "sine" },
      { note: "A5", start: 0.06, dur: 0.08, peak: 0.68, shape: "sine" },
      { note: "C6", start: 0.12, dur: 0.18, peak: 0.72, shape: "sine" },
    ],
  },
  interest_saved: {
    dur: 0.52,
    tones: [
      { note: "E5", start: 0.00, dur: 0.18, peak: 0.62, shape: "sine" },
      { note: "G5", start: 0.08, dur: 0.18, peak: 0.62, shape: "sine" },
      { note: "C6", start: 0.16, dur: 0.32, peak: 0.65, shape: "sine" },
    ],
  },
  debt_paid_off: {
    dur: 2.8,
    tones: [
      { note: "C5", start: 0.00, dur: 0.20, peak: 0.65, shape: "sine" },
      { note: "E5", start: 0.18, dur: 0.20, peak: 0.65, shape: "sine" },
      { note: "G5", start: 0.36, dur: 0.22, peak: 0.68, shape: "sine" },
      { note: "C6", start: 0.56, dur: 0.28, peak: 0.70, shape: "sine" },
      { note: "C5", start: 0.88, dur: 0.95, peak: 0.55, shape: "sine" },
      { note: "E5", start: 0.88, dur: 0.95, peak: 0.52, shape: "sine" },
      { note: "G5", start: 0.88, dur: 0.95, peak: 0.52, shape: "sine" },
      { note: "C6", start: 0.88, dur: 0.95, peak: 0.48, shape: "sine" },
      { note: "G5", start: 1.90, dur: 0.75, peak: 0.42, shape: "sine" },
      { note: "C6", start: 2.08, dur: 0.68, peak: 0.42, shape: "sine" },
    ],
  },
  // Dex vocalization — short wordless sounds (<0.4s). Design brief: approval=up-glide, concern=down-glide, surprise=upward yelp.
  dex_approval: {
    dur: 0.28,
    tones: [
      { note: "G4", start: 0.00, dur: 0.08, peak: 0.52, shape: "sine" },
      { note: "C5", start: 0.05, dur: 0.10, peak: 0.58, shape: "sine" },
      { note: "E5", start: 0.12, dur: 0.14, peak: 0.55, shape: "sine" },
    ],
  },
  dex_concern: {
    dur: 0.26,
    tones: [
      { note: "E5", start: 0.00, dur: 0.08, peak: 0.50, shape: "sine" },
      { note: "C5", start: 0.06, dur: 0.10, peak: 0.48, shape: "sine" },
      { note: "G4", start: 0.12, dur: 0.12, peak: 0.45, shape: "sine" },
    ],
  },
  dex_surprise: {
    dur: 0.22,
    tones: [
      { note: "C5", start: 0.00, dur: 0.06, peak: 0.55, shape: "sine" },
      { note: "G5", start: 0.05, dur: 0.14, peak: 0.58, shape: "sine" },
    ],
  },
};

const OUT_DIR = path.resolve(__dirname, "../assets/sounds");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [name, def] of Object.entries(SOUNDS)) {
  const samples = renderSamples(def.dur, def.tones);
  const wav = floatToWav(samples);
  const outPath = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(outPath, wav);
  const kb = (wav.length / 1024).toFixed(1);
  console.log(`✓ ${name}.wav  (${kb} KB)`);
}

console.log("\nAll sounds generated in assets/sounds/");
