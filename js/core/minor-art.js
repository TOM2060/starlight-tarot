/* ============================================================
   星语 · Starlight Tarot — 小阿尔克那牌面
   统一构图：上 云与手 / 中 核心元素 / 下 远景
   元素符号始终正对观者，轮廓清晰、数量可数
   ============================================================ */

import {
  star4, star8, rays, halo, ring, link, figure, lionHead, setArtUid, TAU,
} from '../core/card-art.js';

let G = 'url(#g-gold)';
let SIL = 'url(#g-sil)';
let C = 'url(#g-gold)';        // 元素主色（随花色切换）
let C2 = 'url(#g-gold)';       // 元素辅色

/* ---------- 通用元素 ---------- */

/** 云：柔和的积云轮廓 */
const cloud = (x, y, s = 1, op = .92) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-27 5 Q-30 -5 -17 -6 Q-13 -15 0 -11 Q11 -18 19 -8 Q29 -8 27 5 Q21 11 0 11 Q-19 11 -27 5Z"
          fill="${SIL}" stroke="${G}" stroke-width=".5" stroke-linejoin="round"/>
    <path d="M-18 -3 Q-7 -7 0 -5 T19 -3" fill="none" stroke="${G}" stroke-width=".3" opacity=".3"/>
  </g>`;

/*
 * 手：正对观者的几何手（4 指 + 手掌 + 小臂）。
 * 不画写实掌纹——小尺寸下只会糊成一团，简洁的轮廓反而更清楚。
 * mode: 'grip' 握持（指并拢） / 'open' 托举（指微张）
 */
const hand = (x, y, s = 1, op = .95, mode = 'grip') => {
  const spread = mode === 'open';
  const fingers = [-4.6, -1.5, 1.6, 4.7];
  const len = spread ? [8, 10, 10, 8] : [9, 9.5, 9.5, 9];
  const tilt = spread ? [-7, -2, 2, 7] : [-3, -1, 1, 3];

  return `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <!-- 小臂 -->
    <path d="M-3.6 22 L-4.6 8 L4.6 8 L3.6 22Z" fill="${SIL}" stroke="${G}" stroke-width=".42" stroke-linejoin="round"/>
    <!-- 手掌 -->
    <path d="M-6.4 8 Q-7.4 1.6 -3.8 -1 L3.8 -1 Q7.4 1.6 6.4 8 Q0 10.4 -6.4 8Z"
          fill="${SIL}" stroke="${G}" stroke-width=".5" stroke-linejoin="round"/>
    <!-- 四指 -->
    ${fingers.map((dx, i) => `
      <rect x="${dx - 1.45}" y="${-1 - len[i]}" width="2.9" height="${len[i] + 1.4}" rx="1.45"
            transform="rotate(${tilt[i]} ${dx} -1)"
            fill="${SIL}" stroke="${G}" stroke-width=".45"/>`).join('')}
    <!-- 指缝 -->
    <path d="M-3.05 -3.4v4.2M0 -3.4v4.2M3.05 -3.4v4.2"
          stroke="${G}" stroke-width=".3" opacity=".35"/>
  </g>`;
};

/** 底部数量角标：n 个小点，一眼可数 */
const count = (n, y = 182) => `
  <g opacity=".55">${Array.from({ length: n }, (_, i) =>
    `<circle cx="${60 + (i - (n - 1) / 2) * 6.4}" cy="${y}" r="1.35" fill="${C}"/>`).join('')}</g>`;

/** 远景山脉 */
const hills = (y, op = .3, tone = G) => `
  <path d="M6 ${y + 16} L28 ${y - 4} L44 ${y + 8} L64 ${y - 10} L88 ${y + 6} L114 ${y + 14}
           L114 190 L6 190 Z" fill="${SIL}" stroke="${tone}" stroke-width=".5" opacity="${op}"/>`;

/* ---------- 元素符号（正对观者，轮廓清晰）---------- */

/** 权杖：木杖 + 顶芽 */
const wandGlyph = (x, y, s = 1, leaf = true) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-1.6 34 L-1.6 -20 a1.6 1.6 0 0 1 3.2 0 L1.6 34 Z" fill="${C}" stroke="${G}" stroke-width=".45"/>
    <path d="M0 12 v22" stroke="${SIL}" stroke-width=".5" opacity=".5"/>
    ${leaf ? `<path d="M0 -20 q-5 -1.6 -7.5 -6.5 4 .6 7.5 3.4 3.5 -2.8 7.5 -3.4 -2.5 4.9 -7.5 6.5Z"
                   fill="${C2}" stroke="${G}" stroke-width=".35" opacity=".95"/>` : ''}
    <path d="M-3.2 6 h6.4M-3.6 20 h7.2" stroke="${G}" stroke-width=".4" opacity=".4"/>
  </g>`;

/** 圣杯：完整的 goblet */
const cupGlyph = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-11 -8 h22 a11 11 0 0 1 -11 16 a11 11 0 0 1 -11 -16Z" fill="${C}" stroke="${G}" stroke-width=".6"/>
    <path d="M-4 8 q4 3 8 0" fill="none" stroke="${G}" stroke-width=".5" opacity=".55"/>
    <path d="M0 9 v6" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M-7 16 h14 a1.6 1.6 0 0 1 -1.6 3 h-10.8 a1.6 1.6 0 0 1 -1.6 -3Z" fill="${C}"/>
    <ellipse cx="0" cy="-7" rx="9" ry="2.4" fill="${C2}" opacity=".75"/>
  </g>`;

/** 宝剑：垂直长剑 */
const swordGlyph = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -32 L3.4 -14 L2.4 6 L-2.4 6 L-3.4 -14 Z" fill="${C}" stroke="${G}" stroke-width=".55"/>
    <path d="M0 -30 L0 4" stroke="${G}" stroke-width=".45" opacity=".55"/>
    <path d="M-12 6 h24 a1.4 1.4 0 0 1 0 2.8 h-24 a1.4 1.4 0 0 1 0 -2.8Z" fill="${C}"/>
    <path d="M0 8.8 v10" stroke="${C}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="0" cy="20.4" r="2.1" fill="${C}"/>
  </g>`;

/** 星币：带五芒星的硬币 */
const coinGlyph = (x, y, s = 1) => {
  let starPath = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const r = i % 2 === 0 ? 6.4 : 2.8;
    starPath += `${i ? 'L' : 'M'}${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
  }
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle r="11.5" fill="${C}" stroke="${G}" stroke-width=".7"/>
    <circle r="9" fill="none" stroke="${G}" stroke-width=".4" opacity=".5"/>
    <circle r="11.5" fill="none" stroke="${G}" stroke-width="1" opacity=".35"/>
    <path d="${starPath}Z" fill="${C2}" stroke="${SIL}" stroke-width=".7" stroke-linejoin="round" opacity=".95"/>
  </g>`;
};

/** 中景氛围：填补云与主体之间的空白，带星语基调 */
const atmos = (y = 92, op = 1) => `
  <g opacity="${op}">
    <ellipse cx="60" cy="${y + 4}" rx="48" ry="26" fill="${C}" opacity=".035"/>
    ${link([[14, y - 10], [38, y + 4], [62, y - 8]], .22, .4)}
    ${link([[78, y + 8], [100, y - 8], [108, y + 2]], .16, .4)}
    ${star4(38, y + 4, 2.2, C, .45)}
    ${star4(62, y - 8, 1.6, C, .3)}
    ${star4(100, y - 8, 1.9, C, .35)}
    ${star4(22, y + 12, 1.5, C, .25)}
  </g>`;

/* ---------- 数字牌的通用零件 ---------- */

/** N 根权杖，arr 为每根的位置与角度 */
const wands = (arr, s = 1, op = 1) => arr.map(([x, y, r = 0, l = 30]) => `
  <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${op}">
    <path d="M-1.3 ${l / 2} L-1.3 ${-l / 2} a1.3 1.3 0 0 1 2.6 0 L1.3 ${l / 2}Z"
          fill="${C}" stroke="${G}" stroke-width=".35"/>
  </g>`).join('');

/** N 把剑 */
const blades = (arr, s = 1, op = 1) => arr.map(([x, y, r = 0, l = 26]) => `
  <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${op}">
    <path d="M0 ${-l / 2} L2.6 ${-l / 2 + 4} L2 ${l / 2 - 5} L-2 ${l / 2 - 5} L-2.6 ${-l / 2 + 4}Z"
          fill="${C}" stroke="${G}" stroke-width=".35"/>
    <path d="M-6 ${l / 2 - 5}h12" stroke="${C}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M0 ${l / 2 - 3}v5" stroke="${C}" stroke-width="1.2" stroke-linecap="round"/>
  </g>`).join('');

/** N 只圣杯 */
const cups = (arr, s = 1, op = 1) => arr.map(([x, y, r = 0]) => `
  <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${op}">
    <path d="M-6 -5h12a6 6 0 0 1 -6 9 6 6 0 0 1 -6 -9Z" fill="${C}" stroke="${G}" stroke-width=".4"/>
    <path d="M0 4v3.4M-3.6 7.6h7.2" stroke="${C}" stroke-width="1.1" stroke-linecap="round"/>
  </g>`).join('');

/** N 枚星币 */
const coins = (arr, s = 1, op = 1) => arr.map(([x, y, r = 0]) => {
  let sp = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const rr = i % 2 === 0 ? 3.6 : 1.6;
    sp += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${op}">
    <circle r="6.4" fill="${C}" stroke="${G}" stroke-width=".5"/>
    <path d="${sp}Z" fill="${C2}" stroke="${SIL}" stroke-width=".4" opacity=".9"/>
  </g>`;
}).join('');

/** 城堡剪影（远景） */
const castle = (x, y, s = 1, op = .35) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-18 0V-11h4v-4h4v4h6v-4h4v4h4v11Z" fill="${SIL}" stroke="${G}" stroke-width=".45"/>
    <path d="M-8 0v-6h5v6" fill="${SIL}" stroke="${G}" stroke-width=".4"/>
  </g>`;

/** 桂冠 */
const laurel = (x, y, r = 11, op = .9) => `
  <g transform="translate(${x} ${y})" fill="none" stroke="${G}" stroke-width=".7" opacity="${op}">
    <path d="M-${r} 2a${r} ${r * .9} 0 0 1 ${r * 2} 0"/>
    ${[-1, -.6, -.2, .2, .6, 1].map((t) =>
      `<ellipse cx="${t * r * .82}" cy="${1.6 - Math.abs(t) * 2.4}" rx="2.2" ry="1.1"
         transform="rotate(${t * 40} ${t * r * .82} ${1.6 - Math.abs(t) * 2.4})" fill="${G}" stroke="none" opacity=".8"/>`).join('')}
  </g>`;

/** 心 */
const heart = (x, y, s = 1, op = .95) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M0 7C-9 1 -8 -5 -4.6 -5Q0 -5 0 -1.4Q0 -5 4.6 -5C8 -5 9 1 0 7Z"
          fill="${C}" stroke="${G}" stroke-width=".45"/>
  </g>`;

/** 窗（远景光源） */
const window = (x, y, s = 1, op = .4) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-6 -9h12v18h-12Z" fill="${C}" stroke="${G}" stroke-width=".45"/>
    <path d="M0 -9v18M-6 0h12" stroke="${G}" stroke-width=".35" opacity=".7"/>
  </g>`;

/** 雨云（带雨线） */
const rainCloud = (x, y, s = 1, op = .85) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-25 3 Q-28 -6 -16 -7 Q-12 -15 0 -11 Q10 -17 17 -8 Q26 -8 24 3 Q18 8 0 8 Q-18 8 -25 3Z"
          fill="${SIL}" stroke="${G}" stroke-width=".5" stroke-linejoin="round"/>
    <g stroke="${C}" stroke-width=".55" stroke-linecap="round" opacity=".7">
      <path d="M-13 12l-2 5M-3 12l-2 5M7 12l-2 5M15 12l-2 5"/>
    </g>
  </g>`;

/* ============================================================
   1 · 权杖首牌 —— 灵感之芽
   ============================================================ */
const aces_wands = () => `
  ${halo(60, 92, 44, null, .6)}
  ${atmos(92)}
  ${hills(152, .26)}

  ${cloud(60, 50, 1.05)}

  <!-- 顶端火苗：正落在新芽之上 -->
  <g opacity=".95">
    <path d="M60 72 q-6 -11 0 -19 6 8 0 19Z" fill="${C}" stroke="${G}" stroke-width=".3"/>
    <path d="M60 74 q-3.4 -6 0 -10 3.4 4 0 10Z" fill="${C2}"/>
    <path d="M50 84 q-3.4 -6 0 -9.4 3.4 3.4 0 9.4ZM70 84 q3.4 -6 0 -9.4 -3.4 3.4 0 9.4Z" fill="${C}" opacity=".7"/>
  </g>
  ${rays(60, 76, 20, 8, .34)}

  ${wandGlyph(60, 112, 1.4)}
  ${hand(60, 122, 1.4, .95, 'grip')}

  <!-- 远山与雏芽 -->
  <path d="M40 168 q6 -6 8 -1" fill="none" stroke="${C2}" stroke-width=".7" opacity=".55"/>
  <path d="M78 172 q5 -5 7 -1" fill="none" stroke="${C2}" stroke-width=".6" opacity=".4"/>

  ${count(1)}
`;

/* ============================================================
   1 · 圣杯首牌 —— 情感满溢
   ============================================================ */
const aces_cups = () => `
  ${halo(60, 82, 44, null, .7)}
  ${atmos(92)}

  ${cloud(60, 44, 1.02)}

  <!-- 溢出的水与降临的圣饼 -->
  <path d="M60 108 q-2 12 0 20 M52 116 q-2 10 0 16 M68 116 q2 10 0 16"
        fill="none" stroke="${C2}" stroke-width=".7" opacity=".55"/>
  <g opacity=".9">
    <ellipse cx="60" cy="34" rx="4.6" ry="3" fill="${C2}"/>
    <path d="M52 36 q-4 2 -6 6M68 36 q4 2 6 6" fill="none" stroke="${G}" stroke-width=".45" opacity=".7"/>
  </g>

  ${cupGlyph(60, 86, 1.35)}
  ${hand(60, 112, 1.35, .95, 'open')}

  <!-- 池水 -->
  <path d="M18 152 q8 -4 16 0 t16 0 16 0 16 0 16 0" fill="none" stroke="${C}" stroke-width=".7" opacity=".45"/>
  <path d="M24 162 q8 -4 16 0 t16 0 16 0 16 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".3"/>
  <path d="M30 172 q7 -3.4 14 0 t14 0 14 0 14 0" fill="none" stroke="${C}" stroke-width=".4" opacity=".2"/>
  <ellipse cx="60" cy="146" rx="4" ry="1.6" fill="${C2}" opacity=".4"/>

  ${count(1)}
`;

/* ============================================================
   1 · 宝剑首牌 —— 思想突破
   ============================================================ */
const aces_swords = () => `
  ${halo(60, 86, 44, null, .6)}
  ${atmos(92)}
  ${rays(60, 70, 40, 12, .26)}

  ${cloud(60, 46, 1.02)}

  ${swordGlyph(60, 88, 1.45)}
  ${hand(60, 119, 1.35, .95, 'grip')}

  <!-- 被剑穿透的王冠：柔和的三瓣冠 -->
  <g opacity=".95">
    <path d="M41 103 Q43 91 48 92.6 Q52 83 56 91 Q60 80 64 91 Q68 83 72 92.6 Q77 91 79 103Z"
          fill="${C}" stroke="${G}" stroke-width=".5" stroke-linejoin="round"/>
    <path d="M39 103 h42 a1.4 1.4 0 0 1 0 2.8 h-42 a1.4 1.4 0 0 1 0 -2.8Z" fill="${C}"/>
    ${[48, 60, 72].map((x) => `<circle cx="${x}" cy="97.4" r="1.6" fill="${SIL}" opacity=".75"/>`).join('')}
  </g>

  <!-- 两侧山峰与水 -->
  <path d="M8 172 L26 152 L42 172Z" fill="${SIL}" stroke="${G}" stroke-width=".5" opacity=".28"/>
  <path d="M78 172 L96 150 L114 172Z" fill="${SIL}" stroke="${G}" stroke-width=".5" opacity=".2"/>
  <path d="M14 180 q8 -3 16 0 t16 0 16 0 16 0 16 0" fill="none" stroke="${C}" stroke-width=".45" opacity=".28"/>

  ${count(1)}
`;

/* ============================================================
   1 · 星币首牌 —— 机会降临
   ============================================================ */
const aces_coins = () => `
  ${halo(60, 84, 44, null, .65)}
  ${atmos(92)}

  ${cloud(60, 46, 1.02)}

  ${coinGlyph(60, 80, 1.3)}
  ${hand(60, 102, 1.35, .95, 'open')}

  <!-- 花园小径与拱门：有厚度的门廊 -->
  <g opacity=".8">
    <path d="M50 178 V152 a10 10 0 0 1 20 0 v26Z"
          fill="${SIL}" stroke="${G}" stroke-width=".7" stroke-linejoin="round"/>
    <path d="M55 178 V153 a5 5 0 0 1 10 0 v25Z" fill="${SIL}" stroke="${C2}" stroke-width=".5" opacity=".8"/>
    <path d="M60 178 V158" stroke="${C2}" stroke-width=".7" opacity=".5"/>
  </g>
  ${[[26, 172], [94, 168], [36, 160], [84, 176], [18, 164], [102, 160]].map(([x, y], i) =>
    star4(x, y, 2.8 - i * .28, C, .6)).join('')}

  <!-- 地面 -->
  <path d="M12 180 q14 -5 28 -1 t28 -2 28 2 28 -3" fill="none" stroke="${G}" stroke-width=".5" opacity=".38"/>

  ${count(1)}
`;


/* ============================================================
   2-5 数字牌
   ============================================================ */

/* ---- 权杖 · 行动 ---- */
const wands_2 = () => `
  ${halo(60, 92, 50, null, .55)}
  ${atmos(92)}
  ${cloud(40, 44, .95, .7)}
  ${figure(46, 166, 1.9, .95, 'stand')}
  ${wands([[60, 141, 0, 50]], 1.4)}
  <g opacity=".9">
    <circle cx="96" cy="150" r="7" fill="${C}" stroke="${G}" stroke-width=".55"/>
    <path d="M89 150h14M96 143q-3.6 7 0 14M96 143q3.6 7 0 14"
          stroke="${G}" stroke-width=".38" opacity=".6" fill="none"/>
  </g>
  <path d="M12 170h96" stroke="${G}" stroke-width=".9" opacity=".6"/>
  ${count(2)}`;

const wands_3 = () => `
  ${halo(60, 76, 50, null, .5)}
  ${atmos(92)}
  ${cloud(34, 42, 1, .7)}
  ${cloud(88, 38, .8, .45)}
  ${wands([[34, 124, -3, 50], [60, 122, 0, 54], [86, 124, 3, 50]], 1.35)}
  <path d="M14 150h92v12H14Z" fill="${SIL}" stroke="${G}" stroke-width=".5" opacity=".65"/>
  <path d="M8 170h104" stroke="${G}" stroke-width=".6" opacity=".35"/>
  <path d="M14 178q9 -3 18 0t18 0 18 0 18 0 18 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".35"/>
  <path d="M90 168h14l-4 5h-7Z" fill="${SIL}" stroke="${G}" stroke-width=".4" opacity=".85"/>
  ${count(3)}`;

const wands_4 = () => `
  ${halo(60, 88, 50, null, .5)}
  ${atmos(92)}
  ${cloud(88, 40, .9, .55)}
  ${castle(60, 116, 1, .3)}
  ${wands([[36, 140, 28, 56], [84, 140, -28, 56], [45, 140, -13, 56], [75, 140, 13, 56]], 1.15)}
  ${figure(44, 166, 1.6, .92, 'raise')}
  ${figure(76, 166, 1.6, .7, 'raise')}
  <path d="M10 170h100" stroke="${G}" stroke-width=".9" opacity=".6"/>
  ${count(4)}`;

const wands_5 = () => `
  ${halo(60, 84, 50, null, .45)}
  ${atmos(92)}
  ${rainCloud(60, 40, .95, .5)}
  ${wands([[26, 112, 36, 46], [48, 116, -20, 46], [76, 116, 20, 46], [94, 112, -36, 46], [60, 120, 78, 46]], 1.05)}
  ${figure(28, 168, 1.35, .85, 'raise')}
  ${figure(50, 168, 1.35, .62, 'raise')}
  ${figure(72, 168, 1.35, .46, 'raise')}
  ${figure(92, 168, 1.35, .3, 'raise')}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(5)}`;

/* ---- 圣杯 · 情感 ---- */
const cups_2 = () => `
  ${halo(60, 84, 50, null, .55)}
  ${atmos(92)}
  ${cloud(60, 40, .85, .5)}
  ${figure(36, 168, 1.7, .95, 'stand')}
  ${figure(84, 168, 1.7, .7, 'stand')}
  ${cups([[36, 129], [84, 129]], 1.25)}
  <path d="M50 142q10 8 20 0" fill="none" stroke="${G}" stroke-width=".65" opacity=".5"/>
  <path d="M12 172h96" stroke="${G}" stroke-width=".9" opacity=".55"/>
  ${count(2)}`;

const cups_3 = () => `
  ${halo(60, 82, 50, null, .55)}
  ${atmos(92)}
  ${cloud(60, 38, .9, .5)}
  ${figure(32, 170, 1.5, .95, 'raise')}
  ${figure(60, 170, 1.55, .72, 'raise')}
  ${figure(88, 170, 1.5, .5, 'raise')}
  ${cups([[32, 136], [60, 132], [88, 136]], 1.2)}
  <g opacity=".6">
    <path d="M18 176v-11M102 176v-11" stroke="${C2}" stroke-width=".65"/>
    ${[0, 1, 2].map((i) => star4(18, 167 + i * 4.2, 2.2, C, .75 - i * .16)).join('')}
    ${[0, 1, 2].map((i) => star4(102, 167 + i * 4.2, 2.2, C, .75 - i * .16)).join('')}
  </g>
  <path d="M12 176h96" stroke="${G}" stroke-width=".7" opacity=".45"/>
  ${count(3)}`;

const cups_4 = () => `
  ${halo(60, 90, 46, null, .4)}
  ${atmos(92)}
  ${rainCloud(60, 44, 1.1, .75)}
  ${figure(60, 158, 1.8, .95, 'throne')}
  ${cups([[32, 174, 180], [60, 176, 180], [88, 174, 180]], 1.2, .9)}
  <path d="M12 180h96" stroke="${G}" stroke-width=".85" opacity=".5"/>
  ${count(4)}`;

const cups_5 = () => `
  ${halo(60, 92, 46, null, .4)}
  ${atmos(92)}
  ${cloud(36, 44, .8, .5)}
  <path d="M20 138V94l7 -12 7 12v44Z" fill="${SIL}" stroke="${G}" stroke-width=".6" opacity=".75"/>
  <path d="M86 138V104l6 -10 6 10v34Z" fill="${SIL}" stroke="${G}" stroke-width=".6" opacity=".55"/>
  ${figure(58, 172, 1.6, .92, 'kneel')}
  <path d="M26 178q11 -4 22 0t22 0 22 0" fill="none" stroke="${C}" stroke-width=".7" opacity=".6"/>
  <path d="M36 184q9 -3 18 0t18 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".4"/>
  ${count(5)}`;

/* ---- 宝剑 · 思想 ---- */
const swords_2 = () => `
  ${halo(60, 88, 46, null, .5)}
  ${atmos(92)}
  ${figure(60, 168, 1.9, .95, 'stand')}
  ${blades([[44, 126, 22, 48], [76, 126, -22, 48]], 1.15)}
  <path d="M50 152h20" stroke="${C}" stroke-width="3" stroke-linecap="round" opacity=".95"/>
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(2)}`;

const swords_3 = () => `
  ${halo(60, 100, 46, null, .45)}
  ${atmos(92)}
  ${rainCloud(60, 44, 1.15, .8)}
  ${heart(60, 132, 1.8, .95)}
  ${blades([[60, 124, 0, 58], [44, 128, 58, 54], [76, 128, -58, 54]], 1.05)}
  <path d="M10 172h100" stroke="${G}" stroke-width=".75" opacity=".45"/>
  ${count(3)}`;

const swords_4 = () => `
  ${halo(60, 92, 46, null, .4)}
  ${atmos(92)}
  ${window(96, 88, 1.5, .5)}
  ${blades([[32, 116, 0, 60], [88, 116, 0, 60]], 1.15)}
  ${blades([[60, 100, 90, 54]], 1.15)}
  ${figure(60, 176, 1.8, .9, 'throne')}
  <path d="M10 180h100" stroke="${G}" stroke-width=".75" opacity=".45"/>
  ${count(4)}`;

const swords_5 = () => `
  ${halo(60, 86, 48, null, .45)}
  ${atmos(92)}
  ${rainCloud(30, 42, .85, .55)}
  ${rainCloud(90, 40, .75, .4)}
  ${blades([[26, 152, -8, 46], [60, 158, 5, 46], [94, 152, 10, 46]], 1, .8)}
  ${figure(38, 170, 1.75, .94, 'walk')}
  <g transform="translate(82 170) scale(-1 1)">${figure(0, 0, 1.75, .5, 'walk')}</g>
  <!-- 被丢在中间的一剑 -->
  ${blades([[60, 170, 84, 34]], .95, .65)}
  <!-- 雨停了 -->
  <g opacity=".3" stroke="${C}" stroke-width=".5" stroke-linecap="round">
    <path d="M44 62l-2 5M52 60l-2 5M68 60l-2 5M76 62l-2 5"/>
  </g>
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(5)}`;

/* ---- 星币 · 现实 ---- */
const coins_2 = () => `
  ${halo(60, 86, 48, null, .55)}
  ${atmos(92)}
  ${cloud(60, 40, .8, .5)}
  ${figure(38, 168, 1.7, .95, 'walk')}
  <g transform="translate(82 168) scale(-1 1)">${figure(0, 0, 1.7, .7, 'walk')}</g>
  ${coins([[38, 128], [82, 128]], 1.4)}
  <path d="M50 142q10 7 20 0" fill="none" stroke="${G}" stroke-width=".65" opacity=".45"/>
  <path d="M12 172h96" stroke="${G}" stroke-width=".9" opacity=".55"/>
  ${count(2)}`;

const coins_3 = () => `
  ${halo(60, 86, 48, null, .5)}
  ${atmos(92)}
  ${castle(60, 112, .9, .25)}
  ${figure(28, 170, 1.4, .9, 'kneel')}
  ${figure(60, 168, 1.45, .68, 'kneel')}
  ${figure(92, 170, 1.4, .48, 'kneel')}
  ${coins([[60, 120]], 1.6)}
  <path d="M10 174h100" stroke="${G}" stroke-width=".75" opacity=".5"/>
  ${count(3)}`;

const coins_4 = () => `
  ${halo(60, 90, 46, null, .5)}
  ${atmos(92)}
  ${cloud(60, 40, .9, .55)}
  ${figure(60, 170, 1.9, .95, 'stand')}
  ${coins([[48, 138], [72, 138], [60, 127]], 1.25)}
  ${coins([[34, 72], [86, 66], [60, 90]], .9, .75)}
  <path d="M10 174h100" stroke="${G}" stroke-width=".75" opacity=".5"/>
  ${count(4)}`;

const coins_5 = () => `
  ${halo(60, 94, 44, null, .35)}
  ${atmos(92)}
  ${window(96, 96, 1.5, .55)}
  ${rainCloud(46, 46, .9, .6)}
  ${figure(56, 172, 1.8, .95, 'stand')}
  ${coins([[48, 132], [65, 137]], 1.15)}
  <g fill="${C2}" opacity=".55">
    ${[[22, 76], [36, 100], [86, 82], [28, 126], [94, 130], [16, 156], [104, 158], [44, 64], [68, 68], [80, 116]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * .35}"/>`).join('')}
  </g>
  <path d="M8 178h104" stroke="${G}" stroke-width=".85" opacity=".5"/>
  ${count(5)}`;


/* ============================================================
   6-10 数字牌
   构图规范：云 y38-46 / 主体 y60-155 / 人物脚底 y160-176 / 地面 y165-180
   ============================================================ */

/* ---- 权杖 ---- */
const wands_6 = () => `
  ${halo(60, 88, 50, null, .55)}
  ${atmos(92)}
  ${cloud(88, 40, .85, .5)}
  ${wands([[30, 130, -16, 48], [50, 134, -6, 50], [70, 134, 6, 50], [90, 130, 16, 48]], 1.1)}
  ${figure(48, 168, 1.8, .95, 'throne')}
  ${laurel(48, 116, 12, .95)}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".55"/>
  ${count(6)}`;

const wands_7 = () => `
  ${halo(60, 86, 50, null, .5)}
  ${atmos(92)}
  ${cloud(34, 42, .9, .6)}
  ${wands([[26, 126, -12, 46], [42, 130, -5, 48], [58, 130, 0, 50], [74, 130, 5, 48], [90, 126, 12, 46]], 1.05)}
  ${figure(60, 150, 1.6, .92, 'stand')}
  <path d="M8 154h104" stroke="${G}" stroke-width="1" opacity=".7"/>
  <path d="M14 166q9 -4 18 0t18 0 18 0 18 0 18 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".35"/>
  ${count(7)}`;

const wands_8 = () => `
  ${halo(60, 84, 50, null, .5)}
  ${atmos(92)}
  ${cloud(84, 38, .8, .45)}
  ${wands([[32, 104, 20, 44], [50, 100, 8, 46], [70, 100, -8, 46], [88, 104, -20, 44]], 1)}
  <g transform="translate(60 116)">
    <path d="M0 -20 L7 -8 L4 6 L-4 6 L-7 -8Z" fill="${SIL}" stroke="${G}" stroke-width=".5"/>
    <path d="M0 -2 L-12 10 M0 -2 L12 10" stroke="${G}" stroke-width="1.1" stroke-linecap="round" fill="none"/>
  </g>
  <path d="M6 160q10 -4 20 0t20 0 20 0 20 0 20 0" fill="none" stroke="${C}" stroke-width=".7" opacity=".5"/>
  <path d="M12 172q10 -4 20 0t20 0 20 0 20 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".3"/>
  ${count(8)}`;

const wands_9 = () => `
  ${halo(60, 90, 48, null, .4)}
  ${atmos(92)}
  ${cloud(38, 44, .8, .5)}
  ${wands([[34, 128, -10, 46], [48, 132, -4, 48], [62, 132, 2, 48], [76, 132, 8, 48], [90, 128, 14, 46]], 1)}
  ${figure(56, 170, 1.8, .92, 'stand')}
  <!-- 缠身的绷带 -->
  <path d="M50 146q7 4 14 0" fill="none" stroke="${C2}" stroke-width="1.2" opacity=".8"/>
  <path d="M12 174h96" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(9)}`;

const wands_10 = () => `
  ${halo(60, 94, 46, null, .4)}
  ${atmos(92)}
  ${rainCloud(60, 40, .85, .5)}
  <g opacity=".92">
    ${[-24, -18, -12, -6, 0, 6, 12, 18, 24, 30].map((dx, i) =>
      `<g transform="translate(${60 + dx} ${118 + Math.abs(dx) * .1}) rotate(${dx * .12})">
         <rect x="-1.1" y="-32" width="2.2" height="64" fill="${C}" stroke="${G}" stroke-width=".3"/>
       </g>`).join('')}
  </g>
  ${figure(60, 176, 1.7, .95, 'stand')}
  <path d="M8 178h104" stroke="${G}" stroke-width=".8" opacity=".45"/>
  ${count(10)}`;

/* ---- 圣杯 ---- */
const cups_6 = () => `
  ${halo(60, 88, 50, null, .5)}
  ${atmos(92)}
  ${cloud(60, 40, .8, .5)}
  ${figure(34, 170, 1.5, .9, 'stand')}
  ${figure(60, 170, 1.55, .68, 'stand')}
  ${figure(86, 170, 1.5, .48, 'stand')}
  ${cups([[34, 136], [60, 132], [86, 136]], 1.05)}
  <g opacity=".65">
    ${[[24, 150], [50, 146], [70, 146], [96, 150]].map(([x, y], i) =>
      star8(x, y, 4.6 - i * .3, C, .8)).join('')}
  </g>
  <path d="M10 174h100" stroke="${G}" stroke-width=".7" opacity=".45"/>
  ${count(6)}`;

const cups_7 = () => `
  ${halo(60, 92, 48, null, .4)}
  ${atmos(92)}
  ${[[26, 118], [46, 108], [66, 112], [86, 106], [40, 136], [62, 140], [82, 134]]
    .map(([x, y], i) => cups([[x, y]], 1 - i * .04, .95)).join('')}
  <!-- 雾中的幻影 -->
  <path d="M12 124h96v10H12Z" fill="${SIL}" opacity=".55"/>
  <path d="M12 148h96v8H12Z" fill="${SIL}" opacity=".4"/>
  ${figure(60, 172, 1.7, .9, 'stand')}
  <g opacity=".45">${[[30, 92], [92, 96], [60, 78]].map(([x, y], i) => star4(x, y, 3 - i * .4, C, .7)).join('')}</g>
  <path d="M10 176h100" stroke="${G}" stroke-width=".7" opacity=".45"/>
  ${count(7)}`;

const cups_8 = () => `
  ${halo(60, 88, 48, null, .4)}
  ${atmos(92)}
  ${cloud(60, 40, .75, .45)}
  <!-- 八座山脊 -->
  <g opacity=".6" fill="${SIL}" stroke="${G}" stroke-width=".45">
    ${[10, 25, 40, 55, 70, 85, 100].map((x, i) =>
      `<path d="M${x - 11} 150 L${x} ${128 - (i % 3) * 8} L${x + 11} 150Z"/>`).join('')}
  </g>
  ${figure(60, 172, 1.7, .92, 'walk')}
  <path d="M52 176q8 -6 16 -2" fill="none" stroke="${G}" stroke-width=".6" opacity=".5"/>
  ${count(8)}`;

const cups_9 = () => `
  ${halo(60, 86, 50, null, .55)}
  ${atmos(92)}
  ${cloud(60, 38, .8, .5)}
  <g opacity=".95">
    ${[10, 23, 36, 49, 62, 75, 88, 101].map((x, i) => {
      const y = 118 + Math.abs(i - 3.5) * 5;
      return cups([[x, y]], .95, .95);
    }).join('')}
  </g>
  ${figure(60, 174, 1.5, .92, 'stand')}
  <path d="M8 172q52 -8 104 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".35"/>
  ${count(9)}`;

const cups_10 = () => `
  ${halo(60, 84, 52, null, .6)}
  ${atmos(92)}
  <!-- 彩虹 -->
  <g fill="none" stroke-width="2" opacity=".5" stroke-linecap="round">
    <path d="M14 96a46 46 0 0 1 92 0" stroke="#ff9ecb"/>
    <path d="M18 96a42 42 0 0 1 84 0" stroke="#ffd98a"/>
    <path d="M22 96a38 38 0 0 1 76 0" stroke="#a8e8c8"/>
  </g>
  ${cups([[22, 128], [38, 118], [54, 112], [70, 112], [86, 118], [102, 128]], .95, .92)}
  ${figure(44, 172, 1.5, .9, 'stand')}
  ${figure(80, 172, 1.5, .62, 'raise')}
  <path d="M8 176h104" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(10)}`;

/* ---- 宝剑 ---- */
const swords_6 = () => `
  ${halo(60, 86, 50, null, .5)}
  ${atmos(92)}
  ${cloud(88, 40, .8, .45)}
  ${blades([[28, 96, 12, 42], [46, 90, 6, 44], [64, 88, 0, 46], [82, 90, -6, 44], [100, 96, -12, 42]], .95, .9)}
  <g opacity=".9">${figure(56, 164, 1.6, .92, 'walk')}</g>
  <g opacity=".7">${figure(78, 160, 1.5, .55, 'walk')}</g>
  <!-- 河与船 -->
  <path d="M6 162q10 -3 20 0t20 0 20 0 20 0 20 0" fill="none" stroke="${C}" stroke-width=".7" opacity=".5"/>
  <path d="M12 174q10 -3 20 0t20 0 20 0 20 0" fill="none" stroke="${C}" stroke-width=".5" opacity=".3"/>
  ${count(6)}`;

const swords_7 = () => `
  ${halo(60, 90, 48, null, .45)}
  ${atmos(92)}
  ${cloud(34, 42, .8, .5)}
  ${blades([[26, 140, -14, 44], [42, 144, -6, 46], [58, 144, 2, 46], [74, 144, 10, 46], [90, 140, 18, 44]], .95, .75)}
  <!-- 悄然取走两把的人 -->
  ${figure(78, 168, 1.7, .92, 'walk')}
  ${blades([[94, 122, 30, 42], [103, 110, 12, 42]], .9, .95)}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(7)}`;

const swords_8 = () => `
  ${halo(60, 92, 46, null, .4)}
  ${atmos(92)}
  ${rainCloud(60, 42, .9, .55)}
  ${blades([[24, 106, 0, 48], [40, 100, 0, 50], [56, 98, 0, 50], [72, 100, 0, 50], [88, 106, 0, 48]], .9, .8)}
  <path d="M34 126h52v10H34Z" fill="${C}" stroke="${G}" stroke-width=".4" opacity=".8"/>
  ${figure(60, 170, 1.6, .95, 'sit')}
  <path d="M50 130h20" stroke="${C2}" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
  <path d="M10 174h100" stroke="${G}" stroke-width=".75" opacity=".45"/>
  ${count(8)}`;

const swords_9 = () => `
  ${halo(60, 92, 46, null, .4)}
  ${atmos(92)}
  ${rainCloud(38, 44, .8, .5)}
  ${blades([[26, 140, -12, 46], [42, 144, -5, 48], [58, 144, 0, 48], [74, 144, 5, 48], [90, 140, 12, 46]], .9, .7)}
  ${figure(60, 170, 1.7, .95, 'kneel')}
  <path d="M50 152q10 -5 20 0" fill="none" stroke="${C2}" stroke-width="1.1" opacity=".75"/>
  <path d="M10 174h100" stroke="${G}" stroke-width=".75" opacity=".45"/>
  ${count(9)}`;

const swords_10 = () => `
  ${halo(60, 100, 44, null, .35)}
  ${atmos(92)}
  ${rainCloud(60, 44, 1, .6)}
  ${blades([[22, 150, -6, 52], [38, 152, -3, 54], [54, 152, 0, 54], [70, 152, 3, 54], [86, 152, 6, 52]], .9, .6)}
  <g transform="translate(60 162) rotate(-90)">${figure(0, 0, 1.7, .92, 'sit')}</g>
  <path d="M12 168a48 12 0 0 0 96 0" fill="none" stroke="${G}" stroke-width="1" opacity=".55"/>
  <path d="M10 176h100" stroke="${G}" stroke-width=".7" opacity=".35"/>
  ${count(10)}`;

/* ---- 星币 ---- */
const coins_6 = () => `
  ${halo(60, 88, 50, null, .5)}
  ${atmos(92)}
  ${cloud(60, 40, .8, .5)}
  <!-- 天平 -->
  <path d="M24 108h72" stroke="${G}" stroke-width="1.1" opacity=".9"/>
  <circle cx="60" cy="108" r="2.2" fill="${C}"/>
  <path d="M24 108v12M24 120q-7 0 -7 5a7 7 0 0 0 14 0q0 -5 -7 -5Z" fill="none" stroke="${G}" stroke-width=".7"/>
  <path d="M96 108v12M96 120q-7 0 -7 5a7 7 0 0 0 14 0q0 -5 -7 -5Z" fill="none" stroke="${G}" stroke-width=".7"/>
  ${figure(60, 170, 1.6, .95, 'stand')}
  ${coins([[46, 136], [74, 136], [36, 152], [84, 152], [60, 144]], .9, .9)}
  <path d="M8 174h104" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(6)}`;

const coins_7 = () => `
  ${halo(60, 88, 50, null, .5)}
  ${atmos(92)}
  ${cloud(86, 40, .8, .45)}
  ${figure(42, 170, 1.8, .95, 'stand')}
  ${wands([[54, 124, 0, 50]], 1.2)}
  <!-- 脚边已收获的成果 -->
  <g opacity=".5">
    ${[24, 38, 52, 66, 80, 94].map((x, i) => `<path d="M${x} 172v-${6 + (i % 3) * 3}"/>`).join('')}
  </g>
  ${coins([[72, 140], [86, 148], [96, 138], [104, 150]], .85, .8)}
  <path d="M8 176h104" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(7)}`;

const coins_8 = () => `
  ${halo(60, 90, 48, null, .45)}
  ${atmos(92)}
  ${castle(88, 116, .85, .3)}
  ${figure(56, 170, 1.8, .95, 'kneel')}
  ${coins([[26, 128], [42, 122], [58, 126], [74, 120], [90, 126], [34, 148], [50, 152], [66, 148]], .9, .85)}
  <!-- 锤与凿 -->
  <path d="M84 150h14M91 150v14" stroke="${G}" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
  <path d="M10 174h100" stroke="${G}" stroke-width=".75" opacity=".45"/>
  ${count(8)}`;

const coins_9 = () => `
  ${halo(60, 84, 52, null, .6)}
  ${atmos(92)}
  ${cloud(60, 36, .8, .5)}
  <g opacity=".4">
    <path d="M14 150h92" stroke="${G}" stroke-width=".6"/>
    ${[20, 34, 48, 62, 76, 90, 104].map((x, i) => star4(x, 142 - (i % 3) * 5, 3.4, C, .7)).join('')}
  </g>
  ${figure(60, 172, 1.7, .95, 'throne')}
  ${laurel(60, 118, 13, .9)}
  ${count(9)}`;

const coins_10 = () => `
  ${halo(60, 86, 52, null, .55)}
  ${atmos(92)}
  ${cloud(60, 38, .8, .5)}
  <!-- 家宅 -->
  <g opacity=".65">
    <path d="M26 168V126l34 -20 34 20v42Z" fill="${SIL}" stroke="${G}" stroke-width=".5"/>
    <path d="M52 168v-22h16v22" fill="${SIL}" stroke="${G}" stroke-width=".45"/>
    <path d="M26 126l34 -20 34 20" fill="none" stroke="${G}" stroke-width=".7"/>
  </g>
  ${figure(60, 172, 1.4, .92, 'stand')}
  ${figure(80, 172, 1, .6, 'stand')}
  ${coins([[20, 140], [32, 132], [44, 138], [56, 128], [68, 136], [80, 126], [92, 134], [100, 142], [26, 154], [64, 150]], .78, .9)}
  <path d="M8 176h104" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${count(10)}`;


/* ============================================================
   宫廷牌 · 侍从 / 骑士 / 女皇 / 国王
   四级递进：侍从好奇 → 骑士行动 → 女皇内蕴 → 国王定局
   ============================================================ */

/** 冕冠：五尖带珠 */
const crown = (x, y, s = 1, op = .95) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-9 3 L-9 -4 L-5.4 0 L0 -7 L5.4 0 L9 -4 L9 3Z" fill="${C}" stroke="${G}" stroke-width=".5"
          stroke-linejoin="round"/>
    <path d="M-10 3.4h20v2.4h-20Z" fill="${C}" stroke="${G}" stroke-width=".4"/>
    <circle cx="0" cy="-8.4" r="1.5" fill="${C2}"/>
    <circle cx="-9" cy="-5.4" r="1" fill="${C2}"/><circle cx="9" cy="-5.4" r="1" fill="${C2}"/>
  </g>`;

/** 花色专属生灵：权杖蜥蜴 / 圣杯鱼 / 宝剑蝶 / 星币牛 */
const pet = (suit, x, y, s = 1, op = .8) => {
  const body = {
    wands: `<path d="M-10 0 Q-6 -3.4 -1 -1.6 Q3 .4 6 -1.6 Q9 -3.6 11 -1
              M-10 0 q-2 1.4 -1 2.6 M-2 -1.4 l-1.6 2.6 M3 .2 l-1 2.6 M8 -1.4 l1.6 2.2"
            stroke="${C}" stroke-width=".9" fill="none" stroke-linecap="round"/>
           <circle cx="10" cy="-2.6" r="1.4" fill="${C}"/>`,
    cups:  `<path d="M-11 0 Q0 6 11 0 Q0 -6 -11 0Z" fill="${C}" stroke="${G}" stroke-width=".4"/>
            <path d="M-11 0 l-4 -2.4 4 2.4 4 -2.4" fill="${C}" opacity=".7"/>
            <circle cx="9" cy="-1.2" r=".9" fill="${G}"/>`,
    swords:`<path d="M0 0 Q-9 -9 -8 -2 Q-7 3 0 2 Q7 3 8 -2 Q9 -9 0 0Z" fill="${C}" stroke="${G}" stroke-width=".4"/>
            <path d="M0 2v4" stroke="${C}" stroke-width="1.2" stroke-linecap="round"/>`,
    coins: `<path d="M-8 3 Q-8 -3 0 -3 Q8 -3 8 3Z" fill="${C}" stroke="${G}" stroke-width=".4"/>
            <path d="M-6 3 Q-7 -4 -9 -6 M6 3 Q7 -4 9 -6" stroke="${C}" stroke-width=".9"
                  fill="none" stroke-linecap="round"/>
            <circle cx="-4" cy="0" r=".8" fill="${G}"/><circle cx="4" cy="0" r=".8" fill="${G}"/>`,
  }[suit];
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">${body}</g>`;
};

/** 骑士的动感线 */
const motion = (x, y, op = .5) => `
  <g opacity="${op}" stroke="${C}" stroke-width=".55" stroke-linecap="round">
    <path d="M${x - 30} ${y - 12}h18M${x - 34} ${y - 5}h14M${x - 30} ${y + 2}h18M${x - 32} ${y + 9}h12"/>
  </g>`;

/** 统一：侍从（站立，好奇） */
const pageBase = (elem, suit) => `
  ${halo(60, 96, 48, null, .5)}
  ${atmos(92)}
  ${cloud(60, 40, .8, .5)}
  ${figure(60, 168, 1.7, .95, 'stand')}
  ${elem}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${pet(suit, 92, 160, .9, .6)}`;

/** 统一：骑士（前倾跨步） */
const knightBase = (elem, suit) => `
  ${halo(60, 96, 48, null, .45)}
  ${atmos(92)}
  ${motion(56, 116, .5)}
  ${figure(58, 166, 1.75, .95, 'knight')}
  ${elem}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>
  ${pet(suit, 94, 158, .9, .55)}`;

/** 统一：女皇（端坐，柔和） */
const queenBase = (elem, suit) => `
  ${halo(60, 100, 50, null, .55)}
  ${atmos(92)}
  ${figure(58, 166, 1.75, .95, 'throne')}
  ${elem}
  ${pet(suit, 94, 162, 1, .7)}
  <path d="M10 172h100" stroke="${G}" stroke-width=".8" opacity=".5"/>`;

/** 统一：国王（端坐 + 冕冠） */
const kingBase = (elem, suit) => `
  ${halo(60, 96, 50, null, .5)}
  ${atmos(92)}
  <!-- 更高的靠背 -->
  <path d="M34 166v-52a26 26 0 0 1 52 0v52" fill="${SIL}" stroke="${G}"
        stroke-width=".6" opacity=".35"/>
  ${figure(58, 166, 1.8, .95, 'throne')}
  ${crown(58, 124, 1.05)}
  ${elem}
  <path d="M10 172h100" stroke="${G}" stroke-width=".85" opacity=".55"/>`;

/* ---- 权杖宫廷（火）---- */
const wands_page = () => pageBase(wands([[72, 124, 22, 44]], 1.15), 'wands');
const wands_knight = () => knightBase(wands([[76, 96, 34, 50]], 1.25), 'wands');
const wands_queen = () => queenBase(`
  ${wands([[92, 130, 4, 62]], 1.15)}
  <circle cx="58" cy="130" r="3" fill="${C2}"/>`, 'wands');
const wands_king = () => kingBase(`
  ${wands([[94, 130, 4, 66]], 1.2)}
  ${crown(58, 120, .35, .9)}`, 'wands');

/* ---- 圣杯宫廷（水）---- */
const cups_page = () => pageBase(cups([[72, 122]], 1.35), 'cups');
const cups_knight = () => knightBase(cups([[84, 100, 12]], 1.3), 'cups');
const cups_queen = () => queenBase(`
  ${cups([[58, 124]], 1.5)}
  <path d="M50 132q8 5 16 0" fill="none" stroke="${C}" stroke-width=".8" opacity=".5"/>`, 'cups');
const cups_king = () => kingBase(`
  ${cups([[58, 122]], 1.55)}`, 'cups');

/* ---- 宝剑宫廷（风）---- */
const swords_page = () => pageBase(blades([[74, 122, 26, 44]], 1.15), 'swords');
const swords_knight = () => knightBase(blades([[82, 94, 40, 50]], 1.25), 'swords');
const swords_queen = () => queenBase(`
  ${blades([[58, 118, 0, 40]], 1.15)}`, 'swords');
const swords_king = () => kingBase(`
  ${blades([[58, 116, 0, 42]], 1.2)}`, 'swords');

/* ---- 星币宫廷（土）---- */
const coins_page = () => pageBase(coins([[72, 126]], 1.4), 'coins');
const coins_knight = () => knightBase(`
  ${coins([[86, 104]], 1.35)}`, 'coins');
const coins_queen = () => queenBase(`
  ${coins([[58, 122]], 1.55)}`, 'coins');
const coins_king = () => kingBase(`
  ${coins([[58, 122]], 1.6)}
  <g opacity=".5">${[[30, 140], [86, 136]].map(([x, y]) => star4(x, y, 2.6, C, .7)).join('')}</g>`, 'coins');

/* ============================================================
   导出
   ============================================================ */

/** 各花色在牌面里的主色 / 辅色 */
const SUIT_INK = {
  wands:  { main: '#ff9a52', sub: '#ffc98a' },
  cups:   { main: '#5aa8ff', sub: '#a8d4ff' },
  swords: { main: '#b9cdf0', sub: '#e2eaf8' },
  coins:  { main: '#6fd6a8', sub: '#a8e8c8' },
};

const art = (fn, suit) => (p) => {
  const u = p?.uid ?? '';
  _uid = u;
  G = `url(#g-gold${u})`;
  SIL = `url(#g-sil${u})`;
  setArtUid(u);
  const ink = SUIT_INK[suit];
  C = ink.main;
  C2 = ink.sub;
  return fn();
};

let _uid = '';

export const MINOR_ART = {
  'wands-01':  art(aces_wands, 'wands'),
  'wands-02':  art(wands_2, 'wands'),
  'wands-03':  art(wands_3, 'wands'),
  'wands-04':  art(wands_4, 'wands'),
  'wands-05':  art(wands_5, 'wands'),
  'wands-06':  art(wands_6, 'wands'),
  'wands-07':  art(wands_7, 'wands'),
  'wands-08':  art(wands_8, 'wands'),
  'wands-09':  art(wands_9, 'wands'),
  'wands-10':  art(wands_10, 'wands'),
  'wands-page':  art(wands_page, 'wands'),
  'wands-knight':art(wands_knight, 'wands'),
  'wands-queen': art(wands_queen, 'wands'),
  'wands-king':  art(wands_king, 'wands'),
  'cups-01':   art(aces_cups, 'cups'),
  'cups-02':   art(cups_2, 'cups'),
  'cups-03':   art(cups_3, 'cups'),
  'cups-04':   art(cups_4, 'cups'),
  'cups-05':   art(cups_5, 'cups'),
  'cups-06':   art(cups_6, 'cups'),
  'cups-07':   art(cups_7, 'cups'),
  'cups-08':   art(cups_8, 'cups'),
  'cups-09':   art(cups_9, 'cups'),
  'cups-10':   art(cups_10, 'cups'),
  'cups-page':  art(cups_page, 'cups'),
  'cups-knight':art(cups_knight, 'cups'),
  'cups-queen': art(cups_queen, 'cups'),
  'cups-king':  art(cups_king, 'cups'),
  'swords-01': art(aces_swords, 'swords'),
  'swords-02': art(swords_2, 'swords'),
  'swords-03': art(swords_3, 'swords'),
  'swords-04': art(swords_4, 'swords'),
  'swords-05': art(swords_5, 'swords'),
  'swords-06': art(swords_6, 'swords'),
  'swords-07': art(swords_7, 'swords'),
  'swords-08': art(swords_8, 'swords'),
  'swords-09': art(swords_9, 'swords'),
  'swords-10': art(swords_10, 'swords'),
  'swords-page':  art(swords_page, 'swords'),
  'swords-knight':art(swords_knight, 'swords'),
  'swords-queen': art(swords_queen, 'swords'),
  'swords-king':  art(swords_king, 'swords'),
  'coins-01':  art(aces_coins, 'coins'),
  'coins-02':  art(coins_2, 'coins'),
  'coins-03':  art(coins_3, 'coins'),
  'coins-04':  art(coins_4, 'coins'),
  'coins-05':  art(coins_5, 'coins'),
  'coins-06':  art(coins_6, 'coins'),
  'coins-07':  art(coins_7, 'coins'),
  'coins-08':  art(coins_8, 'coins'),
  'coins-09':  art(coins_9, 'coins'),
  'coins-10':  art(coins_10, 'coins'),
  'coins-page':  art(coins_page, 'coins'),
  'coins-knight':art(coins_knight, 'coins'),
  'coins-queen': art(coins_queen, 'coins'),
  'coins-king':  art(coins_king, 'coins'),
};
