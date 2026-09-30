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
  style: 'starlight',
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

  try {
    ctx = new AC({ latencyHint: 'interactive' });
  } catch {
    try { ctx = new AC(); } catch { return false; }
  }

  // iOS/Chrome：即使在用户手势内创建，上下文仍可能是 suspended，必须显式恢复
  if (ctx.state === 'suspended') {
    const r = ctx.resume();
    if (r?.catch) r.catch(() => {});
  }

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

/**
 * 恢复上下文。iOS 在切到别的 App、锁屏、来电后都会挂起音频，
 * 所以每次用户触碰都应该尝试恢复一次，而不是只在启动时试。
 */
export function resume() {
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    const r = ctx.resume();
    if (r?.catch) r.catch(() => {});
  }
  return ctx.state === 'running' || ctx.state !== 'suspended';
}

/**
 * 检测 iPhone 侧边静音开关。
 * 苹果的静音键会连带静音网页音频，此时 context 会被挂起且时间不推进。
 */
export function audioStatus() {
  if (!ctx) return { ready: false, state: 'idle', blocked: false };
  const blocked = ctx.state === 'suspended' && ctx.currentTime === 0;
  return { ready: true, state: ctx.state, blocked };
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
   ------------------------------------------------------------
   翻牌音分三段，与 CSS 的 880ms 翻转动画对齐：
     flipLift  0ms    牌被抬起，张力感
     flipMid   280ms  翻转中段，牌面露出的细碎摩擦
     flipLand  880ms  落定的一下
   这样声音和画面是"一起发生"的，而不是一个音闷到底。
   ------------------------------------------------------------ */
const SFX = {
  /** 轻点：选项、按钮 */
  tap: () => tone(660, { dur: 0.1, type: 'sine', vol: 0.1 }),

  /** 按下：略闷，带一点点实体感 */
  press: () => {
    tone(320, { dur: 0.07, type: 'sine', vol: 0.07 });
    noise({ dur: 0.05, freq: 1500, q: 1, vol: 0.04 });
  },

  /** 翻牌 · 第一段：抬起 */
  flipLift: () => {
    noise({ dur: 0.1, freq: 4600, q: 0.5, vol: 0.055 });
    tone(520, { dur: 0.12, type: 'sine', vol: 0.04, glideTo: 760 });
  },

  /** 翻牌 · 第二段：中段的细碎摩擦（最关键的一段） */
  flipMid: () => {
    // 三小段不规则的高频摩擦，模拟牌面掠过
    noise({ dur: 0.13, freq: 3400, q: 0.8, vol: 0.075, delay: 0 });
    noise({ dur: 0.10, freq: 2600, q: 0.7, vol: 0.055, delay: 0.10 });
    noise({ dur: 0.09, freq: 1900, q: 0.6, vol: 0.04, delay: 0.19 });
    // 音高微微上扬
    tone(784, { dur: 0.3, type: 'triangle', vol: 0.045, glideTo: 1175, delay: 0.02 });
  },

  /** 翻牌 · 第三段：落定 */
  flipLand: () => {
    noise({ dur: 0.06, freq: 1600, q: 1.1, vol: 0.13 });
    tone(392, { dur: 0.2, type: 'sine', vol: 0.075 });
    tone(587, { dur: 0.13, type: 'sine', vol: 0.04, delay: 0.012 });
  },

  /** 完整翻牌（不需要分段时用） */
  flip: () => { SFX.flipLift(); setTimeout(() => SFX.flipMid(), 40); setTimeout(() => SFX.flipLand(), 210); },

  /** 洗牌：连续摩擦，中途有一张滑出来 */
  shuffle: () => {
    for (let i = 0; i < 9; i++) {
      noise({ dur: 0.075, freq: 1700 + Math.random() * 1900, q: 0.65, vol: 0.06, delay: i * 0.062 });
    }
    // 洗到末尾，一张滑出牌堆
    noise({ dur: 0.16, freq: 2400, q: 0.5, vol: 0.1, delay: 0.64 });
    tone(880, { dur: 0.22, type: 'sine', vol: 0.05, glideTo: 1174, delay: 0.66 });
  },

  /** 揭晓：上行琶音 + 高频闪光 */
  reveal: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, { dur: 0.55, type: 'sine', vol: 0.12, delay: i * 0.058 }));
    noise({ dur: 0.6, freq: 5200, q: 0.4, vol: 0.045, delay: 0.1 });
  },

  /** 答对：明亮上行三音 */
  right: () => {
    [659.25, 830.61, 987.77].forEach((f, i) =>
      tone(f, { dur: 0.45, type: 'sine', vol: 0.14, delay: i * 0.085 }));
    tone(1318.5, { dur: 0.6, type: 'sine', vol: 0.05, delay: 0.26 });
  },

  /** 答错：柔和下行两音（刻意不刺耳） */
  wrong: () => {
    tone(587.33, { dur: 0.24, type: 'sine', vol: 0.1 });
    tone(440, { dur: 0.42, type: 'sine', vol: 0.095, delay: 0.1 });
  },

  /** 保存：轻柔铃音 */
  save: () => {
    [880, 1318.5, 1760].forEach((f, i) =>
      tone(f, { dur: 0.7, type: 'sine', vol: 0.085 - i * 0.018, delay: i * 0.07 }));
  },

  /** 页面切换 */
  page: () => {
    noise({ dur: 0.11, freq: 3000, q: 0.5, vol: 0.045 });
    tone(784, { dur: 0.18, type: 'sine', vol: 0.05 });
  },

  /** 面板打开 / 关闭 */
  open: () => {
    tone(523, { dur: 0.22, type: 'sine', vol: 0.07, glideTo: 880 });
  },
  close: () => {
    tone(880, { dur: 0.2, type: 'sine', vol: 0.06, glideTo: 523 });
  },

  /** 签到成功：一颗小星落定 */
  star: () => {
    tone(1046.5, { dur: 0.5, type: 'sine', vol: 0.1 });
    tone(1567.98, { dur: 0.7, type: 'sine', vol: 0.05, delay: 0.06 });
  },

  /** 解锁新关卡 */
  unlock: () => {
    [659.25, 880, 1174.66].forEach((f, i) =>
      tone(f, { dur: 0.4, type: 'triangle', vol: 0.1, delay: i * 0.09 }));
  },

  /** 抽到稀有牌：星光 */
  rare: () => {
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) =>
      tone(f, { dur: 1, type: 'sine', vol: 0.095, delay: i * 0.075 }));
    noise({ dur: 1, freq: 7000, q: 0.4, vol: 0.035 });
  },

  /** 彩蛋：下行滑音 + 微光 */
  egg: () => {
    tone(1567.98, { dur: 1.2, type: 'sine', vol: 0.1, glideTo: 523.25 });
    [784, 1046.5].forEach((f, i) =>
      tone(f, { dur: 0.9, type: 'sine', vol: 0.065, delay: 0.2 + i * 0.14 }));
  },

  /** 出错：两声闷响 */
  error: () => {
    tone(330, { dur: 0.12, type: 'triangle', vol: 0.09 });
    tone(262, { dur: 0.2, type: 'triangle', vol: 0.08, delay: 0.1 });
  },
};

export function sfx(name) {
  if (!ready || !settings.sfx) return;
  SFX[name]?.();
}

/* ------------------------------------------------------------
   背景音：钢琴乐句
   ------------------------------------------------------------
   刻意不使用任何低频（< 150Hz）——小喇叭放低频只会挤成噪音。
   音区锁定在中央 C（C4=261.63Hz）以上。
   做法是"乐句库 + 随机组合"：每次播放的顺序不完全一样，
   但同属一套调式，听起来是同一个世界的音乐。
   ------------------------------------------------------------ */

/** 音色：基频 + 7 个泛音，高次泛音衰减更快（钢琴的真实特性） */
const PARTIALS = [
  [1, 1.000, 1.00], [2, 0.46, 0.74], [3, 0.28, 0.58],
  [4, 0.16, 0.45], [5, 0.095, 0.34], [6, 0.055, 0.26],
  [8, 0.030, 0.18],
];

function pianoNote(freq, at, vel = 0.1, dur = 2.6, dest = null) {
  if (!ready) return;
  const g0 = ctx.createGain();
  g0.gain.value = 1;
  g0.connect(dest || bgmGain);

  // 极轻的高频柔化，避免刺耳
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4200;
  lp.Q.value = 0.3;
  lp.connect(g0);

  for (const [n, amp, decayScale] of PARTIALS) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * n;
    // 两根弦的微小失谐：真钢琴的" beating"
    o.detune.value = (Math.random() - 0.5) * (n > 1 ? 2.4 : 1.2);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp * vel, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur * decayScale);
    o.connect(g).connect(lp);
    o.start(at);
    o.stop(at + dur + 0.15);
  }
}

/* ---------- 曲风库 ---------- */
const STYLES = {
  starlight: {
    name: '星夜',
    desc: '缓慢的分解和弦，最接近「星语」本来的样子',
    beat: 1.05,
    density: 0.72,
    // 每一小节一个和弦（Am - F - C - G），只保留中高音区
    chords: [
      [261.63, 329.63, 392.00, 493.88],   // Am
      [261.63, 349.23, 440.00, 523.25],   // F
      [261.63, 329.63, 392.00, 523.25],   // C
      [261.63, 392.00, 493.88, 587.33],   // G
    ],
  },
  moonlight: {
    name: '月光',
    desc: '更慢、更疏，留白很多。安静到像没放音乐',
    beat: 1.5,
    density: 0.46,
    chords: [
      [261.63, 349.23, 440.00, 523.25],   // Fmaj7
      [261.63, 329.63, 415.30, 493.88],   // G7-ish
      [261.63, 329.63, 392.00, 493.88],   // Cmaj7
      [261.63, 349.23, 415.30, 523.25],   // Fmaj7
    ],
  },
  dawn: {
    name: '晨光',
    desc: '稍微明亮一些，有一点向上的能量',
    beat: 0.86,
    density: 0.8,
    chords: [
      [293.66, 369.99, 440.00, 587.33],   // D
      [293.66, 349.23, 440.00, 523.25],   // Bm
      [261.63, 329.63, 392.00, 523.25],   // C
      [293.66, 369.99, 493.88, 587.33],   // A
    ],
  },
  ripple: {
    name: '涟漪',
    desc: '连续快速的琶音，像水面上的光在动',
    beat: 0.52,
    density: 0.92,
    chords: [
      [261.63, 329.63, 392.00, 493.88, 587.33],
      [261.63, 349.23, 440.00, 523.25, 659.25],
      [261.63, 329.63, 415.30, 493.88, 659.25],
      [261.63, 392.00, 493.88, 587.33, 698.46],
    ],
  },
};

export const STYLE_LIST = Object.entries(STYLES)
  .map(([k, v]) => ({ key: k, name: v.name, desc: v.desc }));

/* ---------- 乐句调度 ---------- */
let schedTimer = null;
let beatIdx = 0;

function tick() {
  clearTimeout(schedTimer);
  if (!ready || !settings.bgm) return;

  const st = STYLES[settings.style] || STYLES.starlight;
  const barLen = 4;                     // 每小节 4 拍
  const bar = Math.floor(beatIdx / barLen) % st.chords.length;
  const beatInBar = beatIdx % barLen;
  const chord = st.chords[bar];

  const now = ctx.currentTime;
  const t = now + 0.06;                // 一点余量，避免排程抖动

  // 每个小节的头两拍稍重，后两拍收一点，做出呼吸
  const accent = beatInBar === 0 ? 0.13 : beatInBar === 2 ? 0.085 : 0.06;

  // 琶音：涟漪走上下行，其余走分解
  if (settings.style === 'ripple') {
    const up = beatInBar < 2;
    const idx = up ? beatInBar : 3 - beatInBar + 1;
    pianoNote(chord[Math.min(idx, chord.length - 1)], t, accent, 1.9);
    if (Math.random() < 0.35) {
      pianoNote(chord[Math.min(idx + 2, chord.length - 1)] * 2, t + st.beat * 0.5, accent * 0.45, 1.4);
    }
  } else {
    if (Math.random() < st.density) {
      // 分解和弦：从中间音区取一个，偶或叠加一个
      const base = chord[1 + ((beatInBar + bar) % (chord.length - 1))];
      pianoNote(base, t, accent, 2.8);
      if (Math.random() < 0.26 * st.density) {
        pianoNote(base * 2, t + st.beat * 0.5, accent * 0.42, 2.0);
      }
    }
  }

  beatIdx++;
  schedTimer = setTimeout(tick, st.beat * 1000);
}

function startBgm() {
  if (!ready || bgmNodes.length) return;
  bgmGain.gain.setValueAtTime(0, ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 4.5);
  beatIdx = 0;
  tick();
}

function stopBgm() {
  clearTimeout(schedTimer);
  if (!bgmGain || !ctx) return;
  const t = ctx.currentTime;
  bgmGain.gain.cancelScheduledValues(t);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value, t);
  bgmGain.gain.linearRampToValueAtTime(0, t + 1.4);
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
/** 试听：立即用某首曲子播一小段 */
export function previewStyle(key, seconds = 12) {
  if (!ready) initAudio();
  if (!ready) return false;
  // iOS / Chrome：上下文可能处于 suspended，必须在用户手势内恢复
  resume();
  stopBgm();
  settings.style = key;
  save();
  bgmGain.gain.cancelScheduledValues(ctx.currentTime);
  bgmGain.gain.setValueAtTime(0, ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.5);
  tick();
  setTimeout(() => {
    if (settings.style === key) { stopBgm(); startBgm(); }
  }, seconds * 1000);
  return true;
}

export const currentStyle = () => settings.style;

export function setVolume(v) {
  settings.volume = Math.max(0, Math.min(1, v));
  save();
  if (master) master.gain.value = settings.volume;
}

/** 首次进入时调用：把音频挂到第一次用户手势上 */
export function armAudio() {
  /* iOS Safari 会对 touchstart 做延迟处理，可点元素上 pointerdown
     甚至不触发。所以同时监听 touchend / click / keydown。
     每次手势都尝试恢复上下文——切后台回来时 iOS 会挂起音频。 */
  const onGesture = () => {
    const first = !ready;
    const ok = initAudio();
    if (first && ok) {
      window.dispatchEvent(new CustomEvent('sl-audio-on'));
    }
  };

  const types = ['pointerdown', 'touchend', 'touchstart', 'click', 'keydown'];
  for (const t of types) {
    window.addEventListener(t, onGesture, { capture: true, passive: true });
  }
}
