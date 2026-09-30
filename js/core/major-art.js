/* ============================================================
   星语 · Starlight Tarot — 大阿尔克那 22 张牌面
   构图法则：上三分之一天象 / 中间主体 / 下三分之一基座
   人物一律为深色剪影 + 金线勾边
   ============================================================ */

import {
  star4, star8, rays, halo, ring, link, figure, lionHead, skull, elementGlyph,
  setArtUid, TAU,
} from '../core/card-art.js';

/* ---------- 通用小物件 ---------- */

/*
 * 同页面多张牌并存时，每张牌的 <defs> id 必须唯一，否则渐变会串色。
 * 这里用可变引用：包装器 art() 在真正绘制前把 G / SIL 指向本次的 uid。
 * 绘制过程是同步的，不存在交叉污染。
 */
const G   = () => 'url(#g-gold' + _uid + ')';
const SIL = () => 'url(#g-sil' + _uid + ')';
let _uid = '';

/** 权杖 / 长杖 */
const wand = (x, y, h, op = .8) => `
  <path d="M${x} ${y}v${-h}" stroke="${G()}" stroke-width="1.2" opacity="${op}" stroke-linecap="round"/>
  <circle cx="${x}" cy="${y - h}" r="1.7" fill="${G()}" opacity="${op}"/>`;

/** 圣杯 */
const cup = (x, y, s = 1, op = .9) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-6 -4h12a6 6 0 0 1 -6 8 6 6 0 0 1 -6 -8Z" fill="${SIL()}" stroke="${G()}" stroke-width=".7"/>
    <path d="M0 4v6M-4 10h8" stroke="${G()}" stroke-width=".8" stroke-linecap="round"/>
  </g>`;

/** 宝剑（剑尖朝上） */
const sword = (x, y, s = 1, op = .9) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M0 -20 L2 -6 L1.4 4 L-1.4 4 L-2 -6 Z" fill="${SIL()}" stroke="${G()}" stroke-width=".7"/>
    <path d="M-7 4h14M0 4v8" stroke="${G()}" stroke-width="1" stroke-linecap="round"/>
  </g>`;

/** 翅膀（单侧） */
const wing = (x, y, s = 1, dir = -1, op = .8) => `
  <g transform="translate(${x} ${y}) scale(${dir * s} ${s})" opacity="${op}">
    <path d="M0 0 Q-14 -8 -20 -2 Q-16 2 -8 3 Q-14 7 -6 10 Q-2 8 0 0Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".55" stroke-linejoin="round"/>
  </g>`;

/** 狮身侧面卧姿 */
const lionSide = (x, y, s = 1, op = .9) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-14 0 Q-16 -8 -8 -9 Q2 -11 9 -7 Q12 -5 12 -1
             Q12 3 6 3 L-10 3 Q-15 3 -14 0Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".65" stroke-linejoin="round"/>
    <circle cx="12" cy="-9" r="4.4" fill="${SIL()}" stroke="${G()}" stroke-width=".65"/>
    <path d="M9.6 -12.6a1.6 1.6 0 0 1 1 2.4M14.4 -12.6a1.6 1.6 0 0 0 -1 2.4"
          fill="${SIL()}" stroke="${G()}" stroke-width=".4"/>
    <circle cx="11" cy="-9.4" r=".6" fill="#f7e2bb"/>
    <circle cx="13.4" cy="-9.4" r=".6" fill="#f7e2bb"/>
    <path d="M-8 -9q-5 -5 -1 -8" fill="none" stroke="${G()}" stroke-width=".8" stroke-linecap="round"/>
    <path d="M-12 -5q-5 1 -6 6" fill="none" stroke="${G()}" stroke-width=".8" stroke-linecap="round"/>
    <path d="M-4 3v4M4 3v4" stroke="${G()}" stroke-width="1.2" stroke-linecap="round"/>
  </g>`;

/* ============================================================
   0 · 愚者 The Fool
   ============================================================ */
const fool = () => `
  ${halo(88, 44, 24, null, .8)}
  ${star4(88, 44, 9.5, G, .95)}
  ${rays(88, 44, 18, 8, .4)}

  ${link([[20, 58], [36, 50], [50, 62]], .26)}
  ${star4(20, 58, 2.2, G, .7)}

  <path d="M14 142Q42 136 62 138T108 133" fill="none" stroke="${G()}" stroke-width="1.2" opacity=".85"/>
  <path d="M20 148l-6 10M32 146l-8 12M46 145l-6 10M76 142l-5 12M92 140l-7 11"
        stroke="${G()}" stroke-width=".5" opacity=".35" fill="none"/>

  ${figure(48, 141, 1.45, .97, 'walk')}

  <path d="M55 122q6 -2.6 7.6 2.8t-5.4 5.2q-4.4 -1.8 -2.2 -8Z"
        fill="none" stroke="${G()}" stroke-width=".65" opacity=".7"/>

  ${star8(26, 130, 5.6, G, .82)}
  <path d="M26 136v7" stroke="${G()}" stroke-width=".55" opacity=".6"/>

  <g opacity=".82">
    <ellipse cx="80" cy="139" rx="4.6" ry="3" fill="${SIL()}" stroke="${G()}" stroke-width=".6"/>
    <circle cx="84.4" cy="136.6" r="2.1" fill="${SIL()}" stroke="${G()}" stroke-width=".6"/>
    <path d="M86 135.2l1.4 -1.3M74 139.4l-2.2 1.2M76.4 141.6l-.4 2.2M80 141.6l.6 2.2"
          stroke="${G()}" stroke-width=".5" fill="none" stroke-linecap="round"/>
  </g>
`;

/* ============================================================
   1 · 魔术师 The Magician
   ============================================================ */
const magician = () => `
  ${halo(60, 66, 40, null, .8)}
  ${rays(60, 66, 46, 12, .26)}

  ${figure(60, 128, 1.5, .96, 'raise')}

  <path d="M60 138 C60 131 47 131 47 138 C47 145 73 145 73 138 C73 131 60 131 60 138Z"
        fill="none" stroke="${G()}" stroke-width="1.5" opacity=".95"/>
  ${star4(60, 138, 4, G, .9)}

  <path d="M22 160h76" stroke="${G()}" stroke-width="1.2" opacity=".8"/>
  <path d="M28 167h64" stroke="${G()}" stroke-width=".5" opacity=".32"/>

  ${elementGlyph('fire', 36, 152, .95, .92)}
  ${elementGlyph('water', 51, 152, .95, .92)}
  ${elementGlyph('air', 69, 152, .95, .92)}
  ${elementGlyph('earth', 84, 152, .95, .92)}

  ${star8(60, 178, 6.4, G, .62)}
`;

/* ============================================================
   2 · 女祭司 The High Priestess
   ============================================================ */
const priestess = () => `
  ${halo(60, 52, 32, null, .7)}

  <path d="M40 44a20 20 0 0 0 40 0" fill="none" stroke="${G()}" stroke-width="1.1" opacity=".8"/>
  ${star4(60, 40, 4.2, G, .9)}
  ${star4(41, 41, 2.4, G, .75)}
  ${star4(79, 41, 2.4, G, .75)}

  <path d="M27 60q33 -9 66 0" fill="none" stroke="${G()}" stroke-width=".85" opacity=".55"/>
  <g opacity=".42" stroke="${G()}" stroke-width=".55" fill="none">
    <path d="M31 62q-2 22 1 42t-1 34"/><path d="M38 61q-2 22 1 42t-1 33"/>
    <path d="M45 60.5q-1.6 22 1 42t-1 32"/><path d="M89 60q2 22 -1 42t1 34"/>
    <path d="M82 61q2 22 -1 42t1 33"/><path d="M75 60.5q1.6 22 -1 42t1 32"/>
  </g>

  <g>
    <rect x="18" y="56" width="8" height="112" rx="1" fill="${SIL()}" stroke="${G()}" stroke-width=".9"/>
    <text x="22" y="160" text-anchor="middle" class="cf-glyph" style="font-size:5.5px;letter-spacing:1px;fill:#f3d19a;font-family:'Helvetica Neue',Arial,sans-serif">B</text>
    <rect x="94" y="56" width="8" height="112" rx="1" fill="${SIL()}" stroke="${G()}" stroke-width=".9"/>
    <rect x="95.5" y="58" width="5" height="108" fill="${G()}" opacity=".55"/>
    <text x="98" y="160" text-anchor="middle" class="cf-glyph" style="font-size:5.5px;letter-spacing:1px;fill:#f3d19a;font-family:'Helvetica Neue',Arial,sans-serif">J</text>
  </g>

  ${figure(60, 160, 1.55, .95, 'throne')}
  <path d="M16 176h88" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   3 · 皇后 The Empress
   ============================================================ */
const empress = () => `
  ${halo(60, 78, 44, null, .75)}

  <path d="M40 54l6 -13 7.4 9.6 6.6 -15 6.6 15 7.4 -9.6 6 13Z" fill="${G()}" opacity=".85"/>
  ${star4(60, 30, 3.8, G, .9)}
  ${star4(45.5, 40, 2.2, G, .72)}
  ${star4(74.5, 40, 2.2, G, .72)}

  <path d="M38 154V96q0 -26 22 -26t22 26v58" fill="none" stroke="${G()}" stroke-width=".8" opacity=".35"/>
  <path d="M43 152v-54q0 -21 17 -21t17 21v54" fill="none" stroke="${G()}" stroke-width=".5" opacity=".22"/>

  ${figure(60, 158, 1.6, .96, 'throne')}

  <g transform="translate(60 126) scale(.78)">
    <circle cx="0" cy="-8" r="7.6" fill="${SIL()}" stroke="${G()}" stroke-width="1.5"/>
    ${star4(0, -8, 3.8, G, .9)}
    <path d="M0 0v20M-6.4 9h12.8" stroke="${G()}" stroke-width="1.5" stroke-linecap="round"/>
  </g>

  ${star8(28, 122, 5.4, G, .55)}
  ${star8(92, 126, 4.6, G, .5)}
  <g opacity=".6">
    <path d="M24 158v20M96 158v20" stroke="${G()}" stroke-width=".6"/>
    ${[0, 1, 2, 3].map((i) => star4(24, 159 + i * 5, 2, G, .68 - i * .13)).join('')}
    ${[0, 1, 2, 3].map((i) => star4(96, 159 + i * 5, 2, G, .68 - i * .13)).join('')}
  </g>
  <path d="M18 182h84" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   4 · 皇帝 The Emperor
   ============================================================ */
const emperor = () => `
  ${halo(60, 66, 40, null, .65)}

  <!-- 远山 -->
  <path d="M12 108 L34 76 L52 94 L72 66 L96 100 L108 90 L108 118 L12 118 Z"
        fill="${SIL()}" stroke="${G()}" stroke-width=".6" opacity=".38"/>
  <path d="M34 76l4 8 4 -8M72 66l4 8 4 -8" fill="none" stroke="${G()}" stroke-width=".45" opacity=".5"/>

  <!-- 方座 -->
  <path d="M36 128h48v30q-24 8 -48 0Z" fill="${SIL()}" stroke="${G()}" stroke-width=".75" opacity=".7"/>
  <path d="M40 134h40" stroke="${G()}" stroke-width=".4" opacity=".3"/>

  ${figure(60, 130, 1.35, .95, 'throne')}

  <!-- 公羊之角王冠 -->
  <path d="M48 62q-8 -10 -2 -16M72 62q8 -10 2 -16" fill="none" stroke="${G()}"
        stroke-width="1.3" stroke-linecap="round"/>
  <path d="M52 66q8 -5 16 0" fill="none" stroke="${G()}" stroke-width="1" opacity=".85"/>

  <!-- 手持权杖 -->
  ${wand(94, 140, 46, .85)}

  <path d="M18 176h84" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   5 · 教皇 The Hierophant
   ============================================================ */
const hierophant = () => `
  ${halo(60, 62, 36, null, .7)}

  <!-- 三重冠 -->
  <g fill="none" stroke="${G()}" stroke-width="1" stroke-linecap="round">
    <path d="M42 56q18 -12 36 0" opacity=".9"/>
    <path d="M44 50q16 -11 32 0" opacity=".7"/>
    <path d="M46 45q14 -10 28 0" opacity=".5"/>
  </g>
  <path d="M50 56l3 -8 7 5 7 -5 3 8" fill="${G()}" opacity=".85"/>
  ${star4(60, 38, 3, G, .8)}

  <!-- 举起祝福的手 -->
  <path d="M60 70v-6" stroke="${G()}" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M60 66l-5 -4M60 66l5 -4" stroke="${G()}" stroke-width="1.2" stroke-linecap="round"/>

  ${figure(60, 146, 1.45, .95, 'throne')}
  ${wand(92, 156, 48, .8)}

  <!-- 交叉的双钥 -->
  <g transform="translate(60 172)" opacity=".8">
    <path d="M-9 -5 L9 5M-9 5 L9 -5" stroke="${G()}" stroke-width="1" stroke-linecap="round"/>
    <circle cx="-9.6" cy="-5.4" r="2.1" fill="none" stroke="${G()}" stroke-width=".8"/>
    <circle cx="-9.6" cy="5.4" r="2.1" fill="none" stroke="${G()}" stroke-width=".8"/>
    <path d="M9 -5.6v2.6M9 5.6V3" stroke="${G()}" stroke-width=".7"/>
  </g>

  <!-- 两侧的信徒 -->
  ${figure(26, 178, .68, .5, 'stand')}
  ${figure(94, 178, .68, .5, 'stand')}
`;

/* ============================================================
   6 · 恋人 The Lovers
   ============================================================ */
const lovers = () => `
  ${halo(60, 44, 30, null, .7)}
  <circle cx="60" cy="44" r="11" fill="${SIL()}" stroke="${G()}" stroke-width="1.1"/>
  ${rays(60, 44, 20, 12, .32)}

  <!-- 左月右日 -->
  <path d="M24 72a8 8 0 1 0 0 14 6.4 6.4 0 1 1 0 -14Z" fill="${G()}" opacity=".8"/>
  <circle cx="96" cy="79" r="7" fill="${G()}" opacity=".8"/>
  ${rays(96, 79, 13, 8, .3)}

  <!-- 两人相对而立 -->
  ${figure(46, 152, 1.5, .95, 'stand')}
  ${figure(74, 152, 1.5, .68, 'stand')}

  <!-- 远山 -->
  <path d="M14 172 L44 150 L74 172 Z" fill="${SIL()}" stroke="${G()}" stroke-width=".55" opacity=".3"/>
  <path d="M46 172 L76 148 L106 172 Z" fill="${SIL()}" stroke="${G()}" stroke-width=".55" opacity=".22"/>

  <path d="M16 182h88" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   7 · 战车 The Chariot
   ============================================================ */
const chariot = () => `
  ${halo(60, 48, 32, null, .7)}

  <path d="M60 30a12 12 0 1 0 0 22 9.4 9.4 0 1 1 0 -22Z" fill="${G()}" opacity=".88"/>
  ${star8(88, 38, 5.4, G, .75)}
  ${star8(32, 34, 4.6, G, .62)}

  <path d="M24 60h72l-7 8H31Z" fill="none" stroke="${G()}" stroke-width=".75" opacity=".5"/>
  ${star4(39, 64, 1.7, G, .8)}${star4(51, 64, 1.5, G, .65)}
  ${star4(66, 64, 1.7, G, .8)}${star4(79, 64, 1.4, G, .6)}

  <g>
    <path d="M32 70h56" stroke="${G()}" stroke-width="1.2" opacity=".85"/>
    <path d="M36 70v-5M48 70v-5M60 70v-5M72 70v-5M84 70v-5"
          stroke="${G()}" stroke-width=".7" opacity=".5"/>
    <path d="M34 72h52l-5 40H39Z" fill="${SIL()}" stroke="${G()}" stroke-width="1.05" opacity=".95"/>
    <path d="M40 84h40M41 94h38" stroke="${G()}" stroke-width=".42" opacity=".28"/>
    <path d="M60 78a9 9 0 1 0 0 16 7 7 0 1 1 0 -16Z" fill="${G()}" opacity=".55"/>
  </g>

  ${figure(60, 70, 1, .9, 'stand')}

  ${lionHead(42, 128, 1.25, .95)}
  ${lionHead(78, 128, 1.25, .68)}

  ${ring(42, 156, 8, .7, .5, '2 3')}
  ${ring(78, 156, 8, .7, .5, '2 3')}

  <path d="M18 174h84" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   8 · 力量 Strength
   ============================================================ */
const strength = () => `
  ${halo(60, 58, 36, null, .7)}

  <!-- 永无止境的符号 -->
  <path d="M60 40 C60 34 48 34 48 40 C48 46 72 46 72 40 C72 34 60 34 60 40Z"
        fill="none" stroke="${G()}" stroke-width="1.3" opacity=".9"/>

  <!-- 驯狮者 -->
  ${figure(48, 148, 1.5, .95, 'kneel')}

  <!-- 狮子 -->
  ${lionSide(70, 142, 1.15, .92)}

  <!-- 花环 -->
  <g opacity=".7">
    <path d="M36 128q14 8 28 4" fill="none" stroke="${G()}" stroke-width=".7"/>
    ${[0, 1, 2, 3, 4].map((i) => star4(38 + i * 6.4, 130 + Math.sin(i) * 2.4, 1.7, G, .8 - i * .08)).join('')}
  </g>

  <path d="M20 168q10 -3 20 0t20 0 20 0 20 0" fill="none" stroke="${G()}" stroke-width=".5" opacity=".32"/>
`;

/* ============================================================
   9 · 隐士 The Hermit
   ============================================================ */
const hermit = () => `
  ${halo(56, 118, 30, null, .7)}

  <!-- 山径 -->
  <path d="M12 178 L48 140 L60 132 L72 140 L108 178" fill="${SIL()}"
        stroke="${G()}" stroke-width=".6" opacity=".26"/>

  <!-- 兜帽老者 -->
  <g>
    <path d="M56 66 Q70 72 70 96 L72 160 Q56 170 40 160 L42 96 Q42 72 56 66Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".75" stroke-linejoin="round"/>
    <path d="M48 96q8 6 16 0" fill="none" stroke="${G()}" stroke-width=".5" opacity=".4"/>
    <path d="M50 86q3 -3 6 0M56 86q3 -3 6 0" stroke="${G()}" stroke-width=".6" fill="none" stroke-linecap="round"/>
    <path d="M53 94q3 3 6 0" stroke="${G()}" stroke-width=".5" fill="none" opacity=".5"/>
  </g>

  <!-- 手杖 -->
  <path d="M86 78 L78 166" stroke="${G()}" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>

  <!-- 提灯：内含六芒星 -->
  <g transform="translate(28 116)">
    <path d="M0 -15 L7 -7 L7 7 L0 15 L-7 7 L-7 -7 Z" fill="${SIL()}" stroke="${G()}" stroke-width=".9"/>
    <path d="M0 -9 L4.5 0 L0 9 L-4.5 0 Z" fill="none" stroke="${G()}" stroke-width=".7" opacity=".85"/>
    <path d="M-4.5 0 L4.5 0M0 -9v18" stroke="${G()}" stroke-width=".45" opacity=".6"/>
    <circle cx="0" cy="0" r="1.6" fill="${G()}"/>
    <path d="M0 -15v-5" stroke="${G()}" stroke-width=".6" opacity=".7"/>
  </g>
  <path d="M18 116v34" stroke="${G()}" stroke-width=".55" opacity=".45"/>

  <path d="M14 182h92" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   10 · 命运之轮 Wheel of Fortune
   ============================================================ */
const wheel = () => `
  ${halo(60, 100, 52, null, .75)}

  <g>
    <circle cx="60" cy="100" r="42" fill="${SIL()}" stroke="${G()}" stroke-width="1.2"/>
    <circle cx="60" cy="100" r="34" fill="none" stroke="${G()}" stroke-width=".55" opacity=".6"/>
    <circle cx="60" cy="100" r="12" fill="none" stroke="${G()}" stroke-width=".8" opacity=".7"/>

    <!-- 辐条 -->
    <g stroke="${G()}" stroke-width=".6" opacity=".5">
      ${Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU;
        return `<line x1="${(60 + Math.cos(a) * 12).toFixed(1)}" y1="${(100 + Math.sin(a) * 12).toFixed(1)}"
                      x2="${(60 + Math.cos(a) * 42).toFixed(1)}" y2="${(100 + Math.sin(a) * 42).toFixed(1)}"/>`;
      }).join('')}
    </g>

    <!-- 轮缘刻度 -->
    <g stroke="${G()}" stroke-width=".45" opacity=".45">
      ${Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * TAU;
        return `<line x1="${(60 + Math.cos(a) * 42).toFixed(1)}" y1="${(100 + Math.sin(a) * 42).toFixed(1)}"
                      x2="${(60 + Math.cos(a) * 36).toFixed(1)}" y2="${(100 + Math.sin(a) * 36).toFixed(1)}"/>`;
      }).join('')}
    </g>

    <!-- 四个活物的印记 -->
    ${elementGlyph('fire', 60, 78, .7, .9)}
    ${elementGlyph('water', 82, 100, .7, .9)}
    ${elementGlyph('air', 60, 122, .7, .9)}
    ${elementGlyph('earth', 38, 100, .7, .9)}
  </g>

  <!-- 环绕的蛇 -->
  <path d="M14 74a12 12 0 0 1 22 0" fill="none" stroke="${G()}" stroke-width=".9" opacity=".75"/>
  <path d="M106 126a12 12 0 0 1 -22 0" fill="none" stroke="${G()}" stroke-width=".9" opacity=".5"/>

  ${star4(60, 42, 4.6, G, .8)}
`;

/* ============================================================
   11 · 正义 Justice
   ============================================================ */
const justice = () => `
  ${halo(60, 74, 38, null, .7)}

  <!-- 剑 -->
  ${sword(60, 112, 1.25, .95)}

  <!-- 天平横梁 -->
  <path d="M26 82h68" stroke="${G()}" stroke-width="1.1" opacity=".9"/>
  <circle cx="60" cy="82" r="2" fill="${G()}"/>

  <!-- 两只秤盘 -->
  <g opacity=".9">
    <path d="M26 82v8M26 90q-7 0 -7 5a7 5 0 0 0 14 0q0 -5 -7 -5Z" fill="none" stroke="${G()}" stroke-width=".7"/>
    <path d="M94 82v8M94 90q-7 0 -7 5a7 7 0 0 0 14 0q0 -5 -7 -5Z" fill="none" stroke="${G()}" stroke-width=".7"/>
  </g>

  ${figure(60, 162, 1.35, .95, 'throne')}

  <!-- 正义之冠 -->
  <path d="M52 84q8 -7 16 0" fill="none" stroke="${G()}" stroke-width=".8" opacity=".6"/>

  <path d="M18 178h84" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   12 · 吊人 The Hanged Man
   ============================================================ */
const hanged = () => `
  ${halo(60, 122, 40, null, .75)}

  <!-- T 形架 -->
  <path d="M12 52h96" stroke="${G()}" stroke-width="2.4" opacity=".9" stroke-linecap="round"/>
  <path d="M60 52v14" stroke="${G()}" stroke-width="1.1" opacity=".8"/>
  <path d="M18 52v9M30 52v9M90 52v9M102 52v9"
        stroke="${G()}" stroke-width=".55" opacity=".3"/>

  <!-- 倒悬者：双腿在横梁上交叉成四字 -->
  <g>
    <path d="M60 66 L50 84" stroke="${G()}" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M60 66 L70 84" stroke="${G()}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85"/>
    <path d="M60 66v20" stroke="${G()}" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".7"/>

    <!-- 倒挂的躯干 -->
    <path d="M50 84 Q44 104 48 120 Q60 130 72 120 Q76 104 70 84
             Q60 78 50 84Z" fill="${SIL()}" stroke="${G()}" stroke-width=".85" stroke-linejoin="round"/>
    <!-- 手臂反绑于背后 -->
    <path d="M50 96q-5 8 -1 15M70 96q5 8 1 15" stroke="${G()}"
          stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".8"/>
    <!-- 头（朝下） -->
    <circle cx="60" cy="132" r="6" fill="${SIL()}" stroke="${G()}" stroke-width=".85"/>
    <path d="M56.6 131q3.4 -2 6.8 0" fill="none" stroke="${G()}" stroke-width=".45" opacity=".55"/>
  </g>

  <!-- 头周的光 -->
  ${star8(60, 132, 13, G, .45)}
  ${rays(60, 132, 22, 12, .34)}

  <!-- 脚下静水 -->
  <path d="M18 172q8 -3 16 0t16 0 16 0 16 0" fill="none" stroke="${G()}" stroke-width=".5" opacity=".3"/>
`;

/* ============================================================
   13 · 死神 Death
   ============================================================ */
const death = () => `
  ${halo(60, 40, 22, null, .6)}
  <path d="M18 128h34M22 128a17 17 0 0 1 26 0M22 128a17 17 0 0 0 26 0"
        fill="none" stroke="${G()}" stroke-width=".8" opacity=".55"/>

  <!-- 白袍骑士 -->
  <g>
    <path d="M60 56 Q80 66 80 96 L84 160 Q60 172 36 160 L40 96 Q40 66 60 56Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".8" stroke-linejoin="round"/>
  </g>

  ${skull(60, 74, 1.15, .96)}

  <!-- 举起的白玫瑰 -->
  ${star8(92, 92, 7.2, G, .9)}
  <path d="M92 99v-8" stroke="${G()}" stroke-width=".6" opacity=".7"/>

  <!-- 黑旗 -->
  <path d="M32 72v46" stroke="${G()}" stroke-width="1" opacity=".7"/>
  <path d="M32 74h18l-5 8 5 8H32Z" fill="${SIL()}" stroke="${G()}" stroke-width=".6" opacity=".8"/>

  <!-- 河流 -->
  <path d="M14 176q8 -3 16 0t16 0 16 0 16 0 16 0" fill="none" stroke="${G()}" stroke-width=".5" opacity=".3"/>
`;

/* ============================================================
   14 · 节制 Temperance
   ============================================================ */
const temperance = () => `
  ${halo(60, 62, 40, null, .75)}

  ${wing(42, 62, 1.5, -1, .7)}
  ${wing(78, 62, 1.5, 1, .7)}

  ${figure(60, 150, 1.45, .95, 'stand')}

  <!-- 双杯之间流动的水 -->
  ${cup(38, 106, 1.1, .9)}
  ${cup(84, 118, 1.1, .9)}
  <path d="M44 104 Q60 112 78 116" fill="none" stroke="${G()}" stroke-width="1" opacity=".7"/>
  <path d="M60 110q4 3 2 6" fill="none" stroke="${G()}" stroke-width=".6" opacity=".45"/>

  <!-- 一足踏入水中 -->
  <path d="M16 162h88" stroke="${G()}" stroke-width=".6" opacity=".3"/>
  <path d="M22 170q8 -3 16 0t16 0 16 0 16 0" fill="none" stroke="${G()}" stroke-width=".5" opacity=".3"/>
  <path d="M30 178q7 -2.6 14 0t14 0 14 0 14 0" fill="none" stroke="${G()}" stroke-width=".45" opacity=".22"/>
`;

/* ============================================================
   15 · 恶魔 The Devil
   ============================================================ */
const devil = () => `
  ${halo(60, 44, 32, null, .6)}

  <!-- 巴风特：头 + 角 + 蝙蝠翼 -->
  <g>
    <path d="M46 30q-9 -8 -5 -16M74 30q9 -8 5 -16" fill="none" stroke="${G()}"
          stroke-width="1.1" stroke-linecap="round" opacity=".85"/>
    <path d="M40 34 Q20 28 16 46 Q28 42 36 46Z" fill="${SIL()}" stroke="${G()}" stroke-width=".55" opacity=".8"/>
    <path d="M80 34 Q100 28 104 46 Q92 42 84 46Z" fill="${SIL()}" stroke="${G()}" stroke-width=".55" opacity=".8"/>
    <path d="M60 24 Q74 30 72 48 Q70 60 60 62 Q50 60 48 48 Q46 30 60 24Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".85"/>
    <path d="M52 42l5 2.6M68 42l-5 2.6" stroke="${G()}" stroke-width=".9" stroke-linecap="round"/>
    <path d="M60 50l-2.4 4h4.8Z" fill="${G()}"/>
    <!-- 倒五芒星 -->
    <path d="M60 68l2.9 5.9 6.5 .9 -4.7 4.6 1.1 6.5 -5.8 -3.1 -5.8 3.1 1.1 -6.5 -4.7 -4.6 6.5 -.9Z"
          fill="none" stroke="${G()}" stroke-width=".6" opacity=".7"/>
  </g>

  <!-- 松弛的锁链 -->
  <path d="M40 86q-2 26 0 50" fill="none" stroke="${G()}" stroke-width=".7" opacity=".5" stroke-dasharray="1.5 3"/>
  <path d="M80 86q2 26 0 50" fill="none" stroke="${G()}" stroke-width=".7" opacity=".5" stroke-dasharray="1.5 3"/>

  <!-- 倒悬的两人 -->
  <g transform="translate(40 136) scale(.62 -1)">
    <path d="M-3.2 -19 Q0 -20.9 3.2 -19 L2.3 -11.5 L3.8 0 Q0 1.5 -3.8 0 L-2.3 -11.5 Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".55" stroke-linejoin="round"/>
    <path d="M-3 -18 L-7 -14M3 -18 L7 -22" stroke="${G()}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="-23" r="2.5" fill="${SIL()}" stroke="${G()}" stroke-width=".55"/>
  </g>
  <g transform="translate(80 136) scale(.62 -1)" opacity=".7">
    <path d="M-3.2 -19 Q0 -20.9 3.2 -19 L2.3 -11.5 L3.8 0 Q0 1.5 -3.8 0 L-2.3 -11.5 Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".55" stroke-linejoin="round"/>
    <path d="M-3 -18 L-7 -22M3 -18 L7 -14" stroke="${G()}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="-23" r="2.5" fill="${SIL()}" stroke="${G()}" stroke-width=".55"/>
  </g>

  <!-- 地上的火 -->
  <path d="M22 168q6 -8 8 0 6 -6 7 2M84 168q5 -7 7 0 5 -5 6 2"
        fill="none" stroke="${G()}" stroke-width=".7" opacity=".5" stroke-linecap="round"/>
`;

/* ============================================================
   16 · 高塔 The Tower
   ============================================================ */
const tower = () => `
  <!-- 闪电 -->
  <path d="M72 26 L50 62 L64 62 L44 100" fill="none" stroke="${G()}"
        stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
  <path d="M58 34 L40 66" fill="none" stroke="${G()}" stroke-width=".7" opacity=".45" stroke-linecap="round"/>

  <!-- 塔身 -->
  <g>
    <path d="M44 70h32l4 84H40Z" fill="${SIL()}" stroke="${G()}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M48 70l-3 84M72 70l3 84" stroke="${G()}" stroke-width=".45" opacity=".3"/>
    <path d="M42 96h36M41 124h38" stroke="${G()}" stroke-width=".5" opacity=".35"/>

    <!-- 窗（透出火光） -->
    <path d="M56 100h8v14h-8Z" fill="${G()}" opacity=".8"/>
    <path d="M54 84h12v10H54Z" fill="${G()}" opacity=".55"/>

    <!-- 塔顶与火 -->
    <path d="M38 70 L60 50 L82 70Z" fill="${SIL()}" stroke="${G()}" stroke-width=".8"/>
    <path d="M60 50q-4 -12 0 -18 4 6 0 18Z" fill="${G()}" opacity=".8"/>
    <path d="M50 58q-5 -8 -1 -12M70 58q5 -8 1 -12" fill="none" stroke="${G()}"
          stroke-width=".55" opacity=".6" stroke-linecap="round"/>
  </g>

  <!-- 坠落的人与塔冠 -->
  <g fill="${SIL()}" stroke="${G()}" stroke-width=".5" opacity=".9">
    <path d="M26 96q3 -2 5 0l-1 7q-2 2 -3 0Z"/>
    <circle cx="30" cy="92" r="2"/>
    <path d="M96 118q3 -2 5 0l-1 7q-2 2 -3 0Z"/>
    <circle cx="100" cy="114" r="2"/>
  </g>
  <path d="M16 62l16 -6M104 76l14 4" stroke="${G()}" stroke-width=".8" opacity=".55" stroke-linecap="round"/>

  <!-- 山丘 -->
  <path d="M8 172 L36 150 L64 172 Z" fill="${SIL()}" stroke="${G()}" stroke-width=".5" opacity=".25"/>
`;

/* ============================================================
   17 · 星星 The Star
   ============================================================ */
const star = () => `
  ${halo(60, 66, 42, null, .85)}
  ${rays(60, 66, 50, 16, .3)}

  ${star8(60, 62, 24, G, .95)}
  <path d="M60 38L64 58 84 62 64 66 60 86 56 66 36 62 56 58Z"
        fill="none" stroke="${G()}" stroke-width=".55" opacity=".5"/>

  ${[[24, 38, 3.6], [97, 42, 3.2], [28, 90, 3], [93, 94, 3.4], [60, 24, 3], [17, 64, 2.6], [103, 70, 2.8]]
    .map(([x, y, r]) => star4(x, y, r, G, .8)).join('')}

  <path d="M16 130h88" stroke="${G()}" stroke-width=".65" opacity=".35"/>
  <path d="M22 140q8 -3 16 0t16 0 16 0 16 0" fill="none" stroke="${G()}" stroke-width=".6" opacity=".5"/>
  <path d="M22 150q8 -3 16 0t16 0 16 0 16 0" fill="none" stroke="${G()}" stroke-width=".48" opacity=".38"/>
  <path d="M28 160q7 -2.6 14 0t14 0 14 0 14 0" fill="none" stroke="${G()}" stroke-width=".42" opacity=".28"/>

  <!-- 一人将水倾回池，一人浇灌大地 -->
  <g transform="translate(48 128)">
    <path d="M-4.1 -2.4 Q-4.9 -12.4 0 -15.6 Q4.9 -12.4 4.1 -2.4
             Q6 -1.4 8 -1.1 Q0 1.4 -8 -1.1 Q-6 -1.4 -4.1 -2.4 Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".42" stroke-linejoin="round"/>
    <path d="M-3.2 -11.4 Q0 -8.6 3.2 -11.4" fill="none" stroke="${G()}"
          stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="0" cy="-18.1" r="2.5" fill="${SIL()}" stroke="${G()}" stroke-width=".42"/>
  </g>
  <g transform="translate(80 130)" opacity=".7">
    <path d="M-4.1 -2.4 Q-4.9 -12.4 0 -15.6 Q4.9 -12.4 4.1 -2.4
             Q6 -1.4 8 -1.1 Q0 1.4 -8 -1.1 Q-6 -1.4 -4.1 -2.4 Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".42" stroke-linejoin="round"/>
    <path d="M3.2 -11.4 Q0 -8.6 -3.2 -11.4" fill="none" stroke="${G()}"
          stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="0" cy="-18.1" r="2.5" fill="${SIL()}" stroke="${G()}" stroke-width=".42"/>
  </g>

  <path d="M56 126q-8 6 -4 12" fill="none" stroke="${G()}" stroke-width=".55" opacity=".5"/>
  <path d="M76 128q6 5 3 10" fill="none" stroke="${G()}" stroke-width=".55" opacity=".38"/>
`;

/* ============================================================
   18 · 月亮 The Moon
   ============================================================ */
const moon = () => `
  ${halo(60, 44, 32, null, .8)}

  <!-- 月牙与面孔 -->
  <path d="M60 26a19 19 0 1 0 0 36 14.5 14.5 0 1 1 0 -36Z" fill="${G()}" opacity=".9"/>
  <g opacity=".55" stroke="${G()}" stroke-width=".5" fill="none">
    <path d="M51 38q3.4 2.2 5.6 0M60 38q3.4 2.2 5.6 0M57.6 47q2.4 2.4 4.8 0"/>
  </g>

  <!-- 洒下的月光之滴 -->
  <g opacity=".65" fill="${G()}">
    <path d="M50 64q-3.4 6.4 0 9.4 3.4 -3 0 -9.4Z"/>
    <path d="M64 66q-2.8 5.4 0 8 2.8 -2.6 0 -8Z"/>
    <path d="M57 72q-2 4 0 6 2 -2 0 -6Z"/>
  </g>

  <!-- 月光洒落的短束 -->
  <g stroke="${G()}" stroke-width=".45" opacity=".38" stroke-linecap="round">
    <path d="M42 74v10M50 76v12M60 78v14M70 76v12M78 74v10"/>
  </g>

  <!-- 两座尖塔：一近一远 -->
  <path d="M20 146V100l8 -16 8 16v46Z" fill="${SIL()}" stroke="${G()}" stroke-width=".8" opacity=".9"/>
  <path d="M25 112h6M25 128h6" stroke="${G()}" stroke-width=".5" opacity=".45"/>
  <path d="M86 150V110l6 -12 6 12v40Z" fill="${SIL()}" stroke="${G()}" stroke-width=".7" opacity=".6"/>

  <!-- 蜿蜒的路径 -->
  <path d="M18 174 Q44 158 62 162 T102 178" fill="none" stroke="${G()}" stroke-width=".8" opacity=".5"/>
  <path d="M26 182 Q50 170 68 174 T98 188" fill="none" stroke="${G()}" stroke-width=".5" opacity=".28"/>

  <!-- 两只犬，一近一远 -->
  ${lionSide(40, 172, .9, .9)}
  ${lionSide(82, 176, .78, .5)}

  <!-- 爬出水面的蜥蜴 -->
  <path d="M60 186q1 -9 5.4 -9" fill="none" stroke="${G()}" stroke-width=".75" opacity=".75"/>
  <circle cx="65.4" cy="177" r="1" fill="${G()}" opacity=".75"/>
`;

/* ============================================================
   19 · 太阳 The Sun
   ============================================================ */
const sun = () => `
  ${halo(60, 52, 38, null, .85)}
  ${rays(60, 52, 34, 16, .42)}

  <circle cx="60" cy="52" r="17" fill="${G()}" opacity=".9"/>
  <circle cx="60" cy="52" r="17" fill="none" stroke="#fff" stroke-width=".8" opacity=".5"/>
  <!-- 笑脸 -->
  <g opacity=".55" fill="#3a2568">
    <circle cx="54" cy="48" r="1.5"/><circle cx="66" cy="48" r="1.5"/>
  </g>
  <path d="M54 57q6 5 12 0" fill="none" stroke="#3a2568" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>

  <!-- 围墙 -->
  <path d="M12 122h96v40H12Z" fill="${SIL()}" stroke="${G()}" stroke-width=".7" opacity=".45"/>
  ${Array.from({ length: 13 }, (_, i) => `<path d="M${14 + i * 7.4} 122v-4" stroke="${G()}" stroke-width=".6" opacity=".4"/>`).join('')}

  <!-- 向日葵 -->
  <g opacity=".8">
    ${Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * TAU;
      return `<ellipse cx="${(30 + Math.cos(a) * 5.4).toFixed(1)}" cy="${(146 + Math.sin(a) * 5.4).toFixed(1)}"
        rx="2.4" ry="1.5" transform="rotate(${(i / 10 * 360).toFixed(0)} ${(30 + Math.cos(a) * 5.4).toFixed(1)} ${(146 + Math.sin(a) * 5.4).toFixed(1)})"
        fill="${G()}" opacity=".8"/>`;
    }).join('')}
    <circle cx="30" cy="146" r="3" fill="${SIL()}" stroke="${G()}" stroke-width=".6"/>
    <path d="M30 150v22" stroke="${G()}" stroke-width=".8" opacity=".7"/>
  </g>

  <!-- 红旗与孩童 -->
  <path d="M86 108v48" stroke="${G()}" stroke-width=".9" opacity=".75"/>
  <path d="M86 112h20l-6 6 6 6H86Z" fill="${G()}" opacity=".6"/>
  ${figure(62, 158, 1.15, .95, 'stand')}

  <path d="M16 172h88" stroke="${G()}" stroke-width=".5" opacity=".28"/>
`;

/* ============================================================
   20 · 审判 Judgement
   ============================================================ */
const judgement = () => `
  ${halo(60, 46, 30, null, .75)}

  <!-- 号角天使 -->
  ${wing(40, 44, 1.15, -1, .75)}
  ${wing(80, 44, 1.15, 1, .75)}
  <g>
    <circle cx="60" cy="42" r="5.2" fill="${SIL()}" stroke="${G()}" stroke-width=".8"/>
    <path d="M64 46l14 6 -14 6Z" fill="${SIL()}" stroke="${G()}" stroke-width=".7"/>
    <path d="M52 50q-6 4 -6 12" fill="none" stroke="${G()}" stroke-width="1" stroke-linecap="round"/>
    ${rays(60, 42, 22, 10, .3)}
  </g>

  <!-- 石棺 -->
  <path d="M26 160h68v22H26Z" fill="${SIL()}" stroke="${G()}" stroke-width=".8"/>
  <path d="M22 156h76v6H22Z" fill="${SIL()}" stroke="${G()}" stroke-width=".8"/>

  <!-- 起身的三个身影 -->
  ${figure(60, 156, 1.1, .95, 'raise')}
  ${figure(40, 158, .82, .55, 'stand')}
  ${figure(80, 158, .82, .38, 'stand')}

  <!-- 远山 -->
  <path d="M10 140 L30 122 L44 138 M76 138 L92 118 L110 140"
        fill="none" stroke="${G()}" stroke-width=".55" opacity=".4"/>
`;

/* ============================================================
   21 · 世界 The World
   ============================================================ */
const world = () => `
  ${halo(60, 96, 48, null, .7)}

  <!-- 月桂花环 -->
  <g>
    <ellipse cx="60" cy="98" rx="42" ry="46" fill="none" stroke="${G()}" stroke-width=".9" opacity=".7"/>
    <ellipse cx="60" cy="98" rx="36" ry="40" fill="none" stroke="${G()}" stroke-width=".5" opacity=".45"/>
    <!-- 桂叶 -->
    ${Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * TAU;
      const x = 60 + Math.cos(a) * 39, y = 98 + Math.sin(a) * 43;
      return star4(x, y, 2.6, G, .65);
    }).join('')}
  </g>

  <!-- 舞者：手持双杖 -->
  <g>
    ${figure(60, 156, 1.85, .97, 'raise')}
    <path d="M54 130 L32 116" stroke="${G()}" stroke-width=".95" stroke-linecap="round" opacity=".85"/>
    <path d="M66 130 L88 116" stroke="${G()}" stroke-width=".95" stroke-linecap="round" opacity=".85"/>
    <circle cx="30" cy="115" r="2" fill="${G()}" opacity=".85"/>
    <circle cx="90" cy="115" r="2" fill="${G()}" opacity=".85"/>
  </g>

  <!-- 四角的活物 -->
  <g>
    <!-- 上：鹰（展翼俯冲） -->
    <path d="M60 26q-7 -6 -13 -1M60 26q7 -6 13 -1M60 26q-4 5 0 9 4 -4 0 -9Z"
          fill="${SIL()}" stroke="${G()}" stroke-width=".6" stroke-linejoin="round"/>
    <!-- 右：狮 -->
    ${lionHead(97, 98, .78, .85)}
    <!-- 下：牛（双角） -->
    <path d="M52 172q-6 -6 -10 -1M68 172q6 -6 10 -1M50 180h20"
          fill="none" stroke="${G()}" stroke-width=".8" stroke-linecap="round"/>
    <!-- 左：人 -->
    ${figure(23, 108, .95, .7, 'raise')}
  </g>
`;

/* ---------- 导出表 ---------- */

/** 包装：把 uid 注入到 G / SIL 后再绘制 */
const art = (fn) => (p) => {
  _uid = p?.uid ?? '';
  setArtUid(_uid);
  return fn();
};

export const MAJOR_ART = {
  'major-00': art(fool),
  'major-01': art(magician),
  'major-02': art(priestess),
  'major-03': art(empress),
  'major-04': art(emperor),
  'major-05': art(hierophant),
  'major-06': art(lovers),
  'major-07': art(chariot),
  'major-08': art(strength),
  'major-09': art(hermit),
  'major-10': art(wheel),
  'major-11': art(justice),
  'major-12': art(hanged),
  'major-13': art(death),
  'major-14': art(temperance),
  'major-15': art(devil),
  'major-16': art(tower),
  'major-17': art(star),
  'major-18': art(moon),
  'major-19': art(sun),
  'major-20': art(judgement),
  'major-21': art(world),
};
