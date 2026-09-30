/* ============================================================
   星语 · Starlight Tarot — 音频引擎
   全部用 Web Audio API 实时合成：
   · 没有任何音频文件
   · 没有任何版权问题
   · 体积比一段 mp3 还小
   ============================================================ */

const KEY = 'starlight-tarot:v1';

let ctx = null;
let master = null;       // 总音量
let sfxGain = null;      // 音效
let bgmGain = null;      // 背景音
let bgmNodes = [];
let sparkleTimer = null;
let ready = false;

const settings = {
  sfx: true,
  bgm: true,
  volume: 0.7,
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (s.audio) Object.assign(settings, s.audio);
  } catch { /* 忽略 */ }
}
function save() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    s.audio = { ...settings };
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch { /* 忽略 */ }
}

/* ------------------------------------------------------------
   初始化（必须在用户手势里调用，iOS 强制要求）
   ------------------------------------------------------------ */
export function initAudio() {
  load();
  if (ready) { resume(); return true; }

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;

  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = settings.volume;
  master.connect(ctx.destination);

  sfxGain = ctx.createGain();
  sfxGain.gain.value = settings.sfx ? 1 : 0;
  sfxGain.connect(master);

  bgmGain = ctx.createGain();
  bgmGain.gain.value = 0;
  bgmGain.connect(master);

  ready = true;
  if (settings.bgm) startBgm();
  return true;
}

export function resume() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

/* ------------------------------------------------------------
   合成基元
   ------------------------------------------------------------ */

/** 单个音符 */
function tone(freq, {
  dur = 0.32, type = 'sine', vol = 0.2, delay = 0,
  attack = 0.008, glideTo = null, dest = null,
} = {}) {
  if (!ready) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest || sfxGain);
  o.start(t);
  o.stop(t + dur + 0.06);
}

/** 噪声（纸张、质感） */
function noise({ dur = 0.2, freq = 2200, q = 0.9, vol = 0.18, delay = 0 } = {}) {
  if (!ready) return;
  const t = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(sfxGain);
  src.start(t);
}

/* ------------------------------------------------------------
   音效库
   ------------------------------------------------------------ */
const SFX = {
  /** 轻点：选项、按钮 */
  tap: () => tone(660, { dur: 0.1, type: 'sine', vol: 0.1 }),

  /** 翻牌：纸张抖动 + 落定 */
  flip: () => {
    noise({ dur: 0.17, freq: 2600, q: 0.7, vol: 0.16 });
    tone(520, { dur: 0.16, type: 'triangle', vol: 0.1, glideTo: 880, delay: 0.02 });
  },

  /** 洗牌：连续多张纸摩擦 */
  shuffle: () => {
    for (let i = 0; i < 7; i++) {
      noise({ dur: 0.09, freq: 1800 + Math.random() * 1600, q: 0.6, vol: 0.07, delay: i * 0.072 });
    }
  },

  /** 揭晓：上行琶音 + 高频闪光 */
  reveal: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, { dur: 0.5, type: 'sine', vol: 0.13, delay: i * 0.055 }));
    noise({ dur: 0.5, freq: 5200, q: 0.5, vol: 0.05, delay: 0.1 });
  },

  /** 答对：明亮上行三音 */
  right: () => {
    [659.25, 830.61, 987.77].forEach((f, i) =>
      tone(f, { dur: 0.42, type: 'sine', vol: 0.15, delay: i * 0.085 }));
  },

  /** 答错：柔和下行两音（不惊吓） */
  wrong: () => {
    tone(392, { dur: 0.26, type: 'sine', vol: 0.13 });
    tone(293.66, { dur: 0.42, type: 'sine', vol: 0.12, delay: 0.11 });
  },

  /** 保存：轻柔铃音 */
  save: () => {
    [880, 1318.5].forEach((f, i) =>
      tone(f, { dur: 0.6, type: 'sine', vol: 0.1, delay: i * 0.07 }));
  },

  /** 页面切换 */
  page: () => {
    noise({ dur: 0.12, freq: 3000, q: 0.5, vol: 0.05 });
    tone(784, { dur: 0.16, type: 'sine', vol: 0.05 });
  },

  /** 抽到稀有牌：星光 */
  rare: () => {
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) =>
      tone(f, { dur: 0.9, type: 'sine', vol: 0.1, delay: i * 0.07 }));
    noise({ dur: 0.9, freq: 7000, q: 0.4, vol: 0.04 });
  },

  /** 彩蛋：下行滑音 + 微光 */
  egg: () => {
    tone(1567.98, { dur: 1.1, type: 'sine', vol: 0.11, glideTo: 523.25 });
    [784, 1046.5].forEach((f, i) =>
      tone(f, { dur: 0.8, type: 'sine', vol: 0.07, delay: 0.2 + i * 0.13 }));
  },
};

export function sfx(name) {
  if (!ready || !settings.sfx) return;
  SFX[name]?.();
}

/* ------------------------------------------------------------
   背景音：星空氛围
   低频持续 pad + 缓慢起伏 + 随机星尘音
   ------------------------------------------------------------ */

const PADS = [
  { f: 110.00, type: 'sine',     g: 0.085, lfo: 0.021 },
  { f: 164.81, type: 'sine',     g: 0.055, lfo: 0.017 },  // E3
  { f: 220.00, type: 'sine',     g: 0.038, lfo: 0.029 },  // A3
  { f: 329.63, type: 'triangle', g: 0.016, lfo: 0.036 },  // E4
];

function startBgm() {
  if (!ready || bgmNodes.length) return;

  for (const p of PADS) {
    const o = ctx.createOscillator();
    o.type = p.type;
    o.frequency.value = p.f;

    // 每个声部微微失谐，产生缓慢的拍频，听感更"活"
    const det = ctx.createOscillator();
    det.frequency.value = 0.06 + Math.random() * 0.1;
    const detG = ctx.createGain();
    detG.gain.value = 1.6;
    det.connect(detG).connect(o.detune);

    const g = ctx.createGain();
    g.gain.value = p.g;

    // 极慢的音量呼吸
    const lfo = ctx.createOscillator();
    lfo.frequency.value = p.lfo;
    const lfoG = ctx.createGain();
    lfoG.gain.value = p.g * 0.55;
    lfo.connect(lfoG).connect(g.gain);

    // 低通去掉刺耳的高频
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    f.Q.value = 0.4;

    o.connect(g).connect(f).connect(bgmGain);
    o.start(); lfo.start(); det.start();
    bgmNodes.push(o, lfo, det);
  }

  // 淡入
  bgmGain.gain.setValueAtTime(0, ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 3.2);

  scheduleSparkle();
}

/** 随机星尘音：偶尔一颗，很轻 */
const SCALE = [1046.5, 1174.7, 1396.9, 1567.98, 1760, 2093];
function scheduleSparkle() {
  clearTimeout(sparkleTimer);
  sparkleTimer = setTimeout(() => {
    if (ready && settings.bgm) {
      const f = SCALE[(Math.random() * SCALE.length) | 0];
      tone(f, { dur: 2.4 + Math.random() * 1.6, type: 'sine', vol: 0.028, dest: bgmGain });
    }
    scheduleSparkle();
  }, 7000 + Math.random() * 14000);
}

function stopBgm() {
  clearTimeout(sparkleTimer);
  if (!bgmGain || !ctx) return;
  const t = ctx.currentTime;
  bgmGain.gain.cancelScheduledValues(t);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value, t);
  bgmGain.gain.linearRampToValueAtTime(0, t + 0.8);
  setTimeout(() => {
    bgmNodes.forEach((n) => { try { n.stop(); } catch { /* 已停止 */ } });
    bgmNodes = [];
  }, 900);
}

/* ------------------------------------------------------------
   设置
   ------------------------------------------------------------ */
export const audioSettings = {
  get sfx() { return settings.sfx; },
  get bgm() { return settings.bgm; },
  get volume() { return settings.volume; },
};

export function setSfx(on) {
  settings.sfx = on; save();
  if (sfxGain) sfxGain.gain.value = on ? 1 : 0;
}
export function setBgm(on) {
  settings.bgm = on; save();
  if (!ready) return;
  on ? startBgm() : stopBgm();
}
export function setVolume(v) {
  settings.volume = Math.max(0, Math.min(1, v));
  save();
  if (master) master.gain.value = settings.volume;
}

/** 首次进入时调用：把音频挂到第一次用户手势上 */
export function armAudio() {
  const go = () => {
    initAudio();
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('touchstart', go);
  };
  window.addEventListener('pointerdown', go, { once: false, passive: true });
  window.addEventListener('touchstart', go, { once: false, passive: true });
}
