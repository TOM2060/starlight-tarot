/* ============================================================
   星语 · Starlight Tarot — 牌面绘制系统
   一套参数化的 SVG 画法，保证 78 张牌风格统一
   ============================================================ */

/* ---------- 确定性伪随机：同一张牌每次渲染完全一致 ---------- */
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export const TAU = Math.PI * 2;

/* ---------- 罗马数字 ---------- */
const ROMAN = [
  [''], ['I'], ['II'], ['III'], ['IV'], ['V'], ['VI'], ['VII'], ['VIII'], ['IX'], ['X'],
  ['XI'], ['XII'], ['XIII'], ['XIV'], ['XV'], ['XVI'], ['XVII'], ['XVIII'], ['XIX'], ['XX'],
  ['XXI'],
];
export const roman = (n) => ROMAN[n]?.[0] ?? String(n);

/* ------------------------------------------------------------
   基础图元
   ------------------------------------------------------------ */

/** 四芒星（微光） */
export function star4(cx, cy, r, fill = null, op = 1) {
  return `<path d="M${cx} ${cy - r}Q${cx + r * .17} ${cy - r * .17} ${cx + r} ${cy}
    Q${cx + r * .17} ${cy + r * .17} ${cx} ${cy + r}
    Q${cx - r * .17} ${cy + r * .17} ${cx - r} ${cy}
    Q${cx - r * .17} ${cy - r * .17} ${cx} ${cy - r}Z"
    fill="${fill || G()}" opacity="${op}"/>`;
}

/** 八芒星：长轴 + 短轴交叠 */
export function star8(cx, cy, r, fill = null, op = 1) {
  const s = r * .42;
  return `<path d="M${cx} ${cy - r}L${cx + s} ${cy - s}L${cx + r} ${cy}
    L${cx + s} ${cy + s}L${cx} ${cy + r}L${cx - s} ${cy + s}L${cx - r} ${cy}
    L${cx - s} ${cy - s}Z" fill="${fill || G()}" opacity="${op}"/>
    <path d="M${cx - s} ${cy - r}L${cx} ${cy - s}L${cx + s} ${cy - r}
    L${cx + s} ${cy + s}L${cx} ${cy + r}L${cx - s} ${cy + s}L${cx - s} ${cy - r}Z"
    fill="${fill || G()}" opacity="${op * .5}"/>`;
}

/** 多角星芒（十字光芒） */
export function rays(cx, cy, r, n = 4, op = .34) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const w = .012;
    d += `<path d="M${cx} ${cy}L${cx + Math.cos(a - w) * r} ${cy + Math.sin(a - w) * r}
                  L${cx + Math.cos(a) * r * 1.25} ${cy + Math.sin(a) * r * 1.25}
                  L${cx + Math.cos(a + w) * r} ${cy + Math.sin(a + w) * r}Z" />`;
  }
  return `<g fill="${u('g-starlight')}" opacity="${op}">${d}</g>`;
}

/** 光晕 */
export function halo(cx, cy, r, color = 'var(--halo)', op = .5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${u('g-halo')}" opacity="${op}"/>`;
}

/** 细线圆环 */
export function ring(cx, cy, r, w = .5, op = .6, dash = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${u('g-gold')}"
    stroke-width="${w}" opacity="${op}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
}

/** 星点云 */
export function stardust(seed, w, h, n, op = .55) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = (rand() * w).toFixed(1);
    const y = (rand() * h).toFixed(1);
    const r = (rand() * .9 + .25).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(rand() * op).toFixed(2)}"/>`;
  }
  return out;
}

/** 星座连线：给一串点连成折线 */
export function link(pts, op = .45, w = .5) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return `<path d="${d}" fill="none" stroke="${u('g-gold')}" stroke-width="${w}"
    opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 弧线 */
export function arc(cx, cy, r, a0, a1, w = 1, op = .7) {
  const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"
    fill="none" stroke="${u('g-gold')}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`;
}

/* ------------------------------------------------------------
   人物 / 动物剪影
   深色实心剪影 + 金色细描边，接近传统塔罗的版画质感
   坐标原点 = 脚底中心，站高约 26 单位
   ------------------------------------------------------------ */
let _uid = '';

/** 注入当前牌的唯一后缀：同页多张牌并存时避免 <defs> id 冲突 */
export function setArtUid(u) { _uid = u || ''; }

/** 生成带后缀的 url(#id) 引用 */
const u = (n) => `url(#${n}${_uid})`;

const S   = () => `fill="${u('g-sil')}" stroke="${u('g-gold')}" stroke-width=".42" stroke-linejoin="round"`;
const SL  = () => `fill="none" stroke="${u('g-gold')}" stroke-width="1.25" stroke-linecap="round"`;
const G   = () => u('g-gold');

/** 头 + 长发 */
const head = (cy = -23, hair = true) => `
  <circle cx="0" cy="${cy}" r="2.5" ${S()}/>
  ${hair ? `<path d="M-2.4 ${cy - 1} Q-3.6 ${cy + 2.2} -2.9 ${cy + 4.6}
            M2.4 ${cy - 1} Q3.6 ${cy + 2.2} 2.9 ${cy + 4.6}"
            fill="none" stroke="${u('g-gold')}" stroke-width=".45" opacity=".6"/>` : ''}`;

/** 长袍式躯干：肩宽 ±3.2，腰 ±2.3，裙摆带弧线 —— 修长比例 */
const robe = (hem = 3.8) => `
  <path d="M-3.2 -19 Q0 -20.9 3.2 -19 L2.3 -11.5 L${hem} 0
           Q0 1.5 ${-hem} 0 L-2.3 -11.5 Z" ${S()}/>`;

export const POSES = {
  /** 静立 */
  stand: () => `
    ${robe(3.4)}
    <path d="M-3.1 -18 L-6.2 -13" ${SL()}/>
    <path d="M3.1 -18 L6.2 -13" ${SL()}/>
    ${head()}`,

  /** 迈步向前 */
  walk: () => `
    <path d="M-3 -11.5 Q-3.9 -19 0 -20.8 Q3.9 -19 3 -11.5 L3.3 -3
             Q0 -1.6 -3.3 -3 Z" ${S()}/>
    <path d="M-1.5 -3 L-4.4 .5 M1.7 -3 L4.2 .2" stroke="${u('g-gold')}"
          stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M-2.9 -17.8 L-6.6 -13.4" ${SL()}/>
    <path d="M2.9 -17.8 L6.8 -14.4" ${SL()}/>
    ${head()}`,

  /** 举臂向天 */
  raise: () => `
    <path d="M-3.1 -11.5 Q-4 -19.2 0 -21 Q4 -19.2 3.1 -11.5 L3.9 0
             Q0 1.4 -3.9 0 Z" ${S()}/>
    <path d="M-3 -18.4 L-7 -23.4" ${SL()}/>
    <path d="M3 -18.4 L7 -23.8" ${SL()}/>
    ${head()}`,

  /** 跪坐 · 双手捧物 */
  kneel: () => `
    <path d="M-4.1 -2.4 Q-4.9 -12.4 0 -15.6 Q4.9 -12.4 4.1 -2.4
             Q6 -1.4 8 -1.1 Q0 1.4 -8 -1.1 Q-6 -1.4 -4.1 -2.4 Z" ${S()}/>
    <path d="M-3.2 -11.4 Q0 -8.6 3.2 -11.4" ${SL()}/>
    ${head(-18.1)}`,

  /** 端坐 · 静观 */
  sit: () => `
    <path d="M-3.7 -2.2 Q-4.3 -11.8 0 -15.4 Q4.3 -11.8 3.7 -2.2
             Q5.6 -1.5 7.6 -1.3 Q0 1.3 -7.6 -1.3 Q-5.6 -1.5 -3.7 -2.2 Z" ${S()}/>
    <path d="M-3.2 -12.6 L-5.4 -8.6 M3.2 -12.6 L5.4 -8.6" ${SL()}/>
    ${head(-17.9)}`,

  /** 骑士 · 前倾跨步，单臂前伸 */
  knight: () => `
    <path d="M-4.4 -18.4 Q0 -20.8 3.6 -18 L7.4 -6.4 Q0 -2.6 -7 -6.4 Z" ${S()}/>
    <path d="M3 -17.6 L10.6 -21" ${SL()}/>
    <path d="M-3.6 -15 L-8.4 -19.4" ${SL()}/>
    <path d="M-2 -4.6 L-7.4 1.4" stroke="${u('g-gold')}" stroke-width="1.6"
          stroke-linecap="round" fill="none"/>
    <path d="M2.6 -4 L8.6 1.8" stroke="${u('g-gold')}" stroke-width="1.6"
          stroke-linecap="round" fill="none"/>
    <circle cx="-1.2" cy="-22.6" r="2.5" ${S()}/>
    <path d="M-3.6 -23.8 Q-5 -20 -3.6 -17.4" fill="none" stroke="${u('g-gold')}"
          stroke-width=".4" opacity=".5"/>
  `,

  /** 盘腿 · 长袍覆地（皇后/教皇/审判） */
  throne: () => `
    <path d="M-4.5 -2 Q-5.1 -13.2 0 -16.8 Q5.1 -13.2 4.5 -2
             Q6.6 -1.3 10 0 Q0 2.2 -10 0 Q-6.6 -1.3 -4.5 -2 Z" ${S()}/>
    <path d="M-3.3 -13.8 L-7.8 -9" ${SL()}/>
    <path d="M3.3 -13.8 L7.8 -9" ${SL()}/>
    ${head(-19.4)}`,
};

/** 人物剪影 */
export function figure(x, y, s = 1, op = .95, pose = 'stand') {
  const body = (POSES[pose] || POSES.stand)();
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">${body}</g>`;
}

/** 狮头（正面）：实心鬃毛 + 面部 */
export function lionHead(x, y, s = 1, op = .9) {
  // 鬃毛：长短齿状边缘的封闭多边形
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * TAU - Math.PI / 2;
    const r = i % 2 === 0 ? 9.8 : 7.4;
    pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <polygon points="${pts.join(' ')}" fill="${u('g-sil')}"
      stroke="${u('g-gold')}" stroke-width=".45" stroke-linejoin="round"/>
    <circle r="6.3" ${S()}/>
    <path d="M-4.6 -4.4a1.9 1.9 0 1 1 .6 2.4M4.6 -4.4a1.9 1.9 0 1 0 -.6 2.4"
          fill="${u('g-sil')}" stroke="${G()}" stroke-width=".45"/>
    <ellipse cx="-2.2" cy="-1.4" rx="1.5" ry=".85" fill="#f7e2bb" opacity=".9"/>
    <ellipse cx="2.2" cy="-1.4" rx="1.5" ry=".85" fill="#f7e2bb" opacity=".9"/>
    <path d="M0 0 L-1.4 2.8 L1.4 2.8 Z" fill="${G()}"/>
    <path d="M-2.1 3.8 Q0 6.1 2.1 3.8" fill="none" stroke="${G()}" stroke-width=".6"/>
    <path d="M-3.4 3.4l-1.4 1M3.4 3.4l1.4 1" stroke="${G()}" stroke-width=".45" opacity=".8"/>
  </g>`;
}

/** 骷髅侧脸（死神） */
export function skull(x, y, s = 1, op = .9) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M0 -8 Q7 -8 7 -1 Q7 3.4 3.6 4.2 L3 7.6 L-3 7.6 L-3.6 4.2 Q-7 3.4 -7 -1 Q-7 -8 0 -8Z" ${S()}/>
    <ellipse cx="-2.7" cy="-1.4" rx="2" ry="2.4" fill="#0b0620"/>
    <ellipse cx="2.7" cy="-1.4" rx="2" ry="2.4" fill="#0b0620"/>
    <path d="M0 1.4 L-1.1 3.6 L1.1 3.6 Z" fill="${u('g-gold')}"/>
    <path d="M-2 5.2h4M0 5.2v2.4" stroke="${u('g-gold')}" stroke-width=".45" opacity=".7"/>
  </g>`;
}

/** 四元素小符号：火/水/风/土 */
export function elementGlyph(kind, x, y, s = 1, op = .9) {
  const g = {
    fire: `<path d="M0 -5Q3 -1.6 3 1.4Q3 5 0 5Q-3 5 -3 1.4Q-3 -1 0 -5Z" fill="${u('g-gold')}"/>`,
    water: `<path d="M0 -5Q4 1 4 2.6A4 4 0 0 1 -4 2.6Q-4 1 0 -5Z" fill="${u('g-gold')}"/>`,
    air: `<path d="M-5 -1.6L4.6 -1.6M-5 1.6L4.6 1.6M-3.6 -4.4L3.6 -4.4" stroke="${u('g-gold')}"
           stroke-width="1.1" fill="none" stroke-linecap="round"/>`,
    earth: `<path d="M0 -4.6L4.6 0 0 4.6 -4.6 0Z" fill="${u('g-gold')}"/>`,
  }[kind];
  return g ? `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">${g}</g>` : '';
}

/* ------------------------------------------------------------
   花色专属暗纹：铺在牌面底层的重复纹样
   让 56 张小牌即使构图相似，也能靠"底纹"分辨花色
   ------------------------------------------------------------ */
export const SUIT_MOTIF = {
  // 权杖 · 火：斜向羽状，像腾起的火苗
  wands: `<g stroke="#f0c888" stroke-width=".8" fill="none" opacity=".85">
    <path d="M-2 20 L16 4 M2 24 L22 6 M8 26 L26 12"/></g>`,

  // 圣杯 · 水：横向波纹
  cups: `<g stroke="#8fc4ff" stroke-width=".75" fill="none" opacity=".8">
    <path d="M0 8 q5 4 10 0 t10 0 M0 18 q5 4 10 0 t10 0 M0 28 q5 4 10 0 t10 0"/></g>`,

  // 宝剑 · 风：锐角交叉，像羽翼
  swords: `<g stroke="#c6d4f0" stroke-width=".75" fill="none" opacity=".8">
    <path d="M1 25 L20 6 M6 26 L25 7 M-1 15 L11 3 M14 26 L25 15"/></g>`,

  // 星币 · 土：同心弧，像麦芒与年轮
  coins: `<g stroke="#9ee0bd" stroke-width=".7" fill="none" opacity=".8">
    <circle cx="6" cy="6" r="3.2"/><circle cx="19" cy="19" r="3.2"/>
    <path d="M6 11.5v3M2.2 8h3M19 11.5v3M15.2 17h3"/></g>`,
};

/** 铺一层花色暗纹在牌面底层 */
function motifLayer(suit, w, h, uid) {
  const p = SUIT_MOTIF[suit];
  if (!p) return '';
  const pid = `p${uid}`;
  return `
    <defs>
      <pattern id="${pid}" width="26" height="26" patternUnits="userSpaceOnUse">${p}</pattern>
    </defs>
    <rect x="6" y="6" width="${w - 12}" height="${h - 12}"
          fill="url(#${pid})" opacity=".085"/>`;
}

/* ------------------------------------------------------------
   牌面外壳
   ------------------------------------------------------------ */

/** 各花色的主题色（决定背景色调，让 78 张有分区） */
export const SUIT_THEME = {
  major: { a: '#241257', b: '#0c0726', glow: '#8b6cff' },
  wands: { a: '#3a1a3f', b: '#150724', glow: '#ff9a52' },
  cups:  { a: '#132a52', b: '#07122b', glow: '#5aa8ff' },
  swords:{ a: '#182647', b: '#080e1f', glow: '#9fb8e8' },
  coins: { a: '#1b2f3c', b: '#0a161f', glow: '#6fd6a8' },
};

/**
 * 生成一张完整牌面的 SVG 字符串
 * @param {object} card  牌数据（含 art 键）
 * @param {object} artFn 对应牌面的画面绘制函数
 * @param {object} opts  w / h / uid
 *   uid 必须为同页面每张牌传入唯一值，否则多个 SVG 的
 *   <defs> id 会互相覆盖，导致渐变引用到别人的颜色。
 */
export function renderCard(card, artFn, { w = 120, h = 210, uid = '' } = {}) {
  const theme = SUIT_THEME[card.suit] || SUIT_THEME.major;
  const seed = card.seed ?? 1;
  const num = roman(card.n ?? 0);
  const label = card.n === 0 && card.suit === 'major' ? '0' : num;

  // defs 的 id 带唯一后缀
  const U = (n) => `${n}${uid}`;

  return `
<svg class="cardface" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${card.name}">
  <defs>
    <linearGradient id="${U('g-bg')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.a}"/>
      <stop offset=".55" stop-color="${theme.b}"/>
      <stop offset="1" stop-color="${theme.b}"/>
    </linearGradient>
    <linearGradient id="${U('g-gold')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffeccb"/>
      <stop offset=".5" stop-color="#f3d19a"/>
      <stop offset="1" stop-color="#c39a56"/>
    </linearGradient>
    <radialGradient id="${U('g-halo')}" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${theme.glow}" stop-opacity=".55"/>
      <stop offset=".55" stop-color="${theme.glow}" stop-opacity=".14"/>
      <stop offset="1" stop-color="${theme.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${U('g-starlight')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#cdb6ff"/>
    </linearGradient>
    <linearGradient id="${U('g-sil')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#3a2568"/>
      <stop offset=".5"  stop-color="#1c1140"/>
      <stop offset="1"   stop-color="#0d0726"/>
    </linearGradient>
    <clipPath id="${U('g-inner')}"><rect x="7" y="7" width="${w - 14}" height="${h - 14}" rx="6"/></clipPath>
  </defs>

  <rect width="${w}" height="${h}" rx="9" fill="url(#${U('g-bg')})"/>
  <rect width="${w}" height="${h}" rx="9" fill="url(#${U('g-gold')})" opacity=".06"/>

  <g clip-path="url(#${U('g-inner')})">
    ${motifLayer(card.suit, w, h, uid)}
    ${stardust(seed, w, h, 34, .5)}
    ${artFn ? artFn({ w, h, seed, rng: rng(seed), uid }) : ''}
  </g>

  <!-- 内框 -->
  <rect x="7" y="7" width="${w - 14}" height="${h - 14}" rx="6"
        fill="none" stroke="url(#${U('g-gold')})" stroke-width=".75" opacity=".7"/>
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="8"
        fill="none" stroke="url(#${U('g-gold')})" stroke-width="1.1" opacity=".95"/>

  <!-- 顶部编号 -->
  <text x="${w / 2}" y="19" text-anchor="middle" class="cf-num"
        style="font-size:7px;letter-spacing:1.4px;fill:#f3d19a;opacity:.92;font-family:'Songti SC','STSong',serif">${label}</text>

  <!-- 底部牌名 -->
  <text x="${w / 2}" y="${h - 16}" text-anchor="middle" class="cf-name"
        style="font-size:10.5px;letter-spacing:2px;fill:#f5f1ff;font-family:'Songti SC','STSong',serif">${card.name}</text>
  <text x="${w / 2}" y="${h - 8}" text-anchor="middle" class="cf-en"
        style="font-size:3.4px;letter-spacing:.75px;fill:#8a7db2;font-family:'Helvetica Neue',Arial,sans-serif">${card.en.toUpperCase()}</text>
</svg>`;
}
