/* ============================================================
   星语 · Starlight Tarot — 分享海报
   用 Canvas 绘制单牌精华图，输出为 data URL 供长按保存
   ============================================================ */

import { renderCard } from './card-art.js';
import { artOf } from './art-index.js';

const W = 1080;
const H = 1440;
const PAD = 86;
const FONT_DISPLAY = '"Songti SC", "STSong", "Noto Serif SC", serif';
const FONT_BODY = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

const GOLD = '#f3d19a';
const GOLD_BRIGHT = '#ffeccb';
const INK = '#f5f1ff';
const INK2 = '#c1b5e2';
const INK4 = '#8a7db2';

/* ------------------------------------------------------------
   工具
   ------------------------------------------------------------ */

/** 把 SVG 字符串变成已加载的 Image */
function svgToImage(svg) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('牌面渲染失败'));
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  });
}

/** 按宽度折行 */
function wrap(ctx, text, maxW) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ch === '\n') { lines.push(line); line = ''; continue; }
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 确定性星点（同一天同一张牌，海报上的星也一样） */
function starField(seed, n, w, h) {
  let s = seed >>> 0 || 1;
  const rand = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ x: rand() * w, y: rand() * h, r: rand() * 2.1 + .5, a: rand() * .5 + .12 });
  }
  return out;
}

/* ------------------------------------------------------------
   绘制
   ------------------------------------------------------------ */

/**
 * 生成海报
 * @param {object} card   牌数据
 * @param {boolean} reversed
 * @param {string} dateLabel  底部日期文字
 * @param {string} line       底部一句诗
 * @returns {Promise<string>} data URL
 */
export async function makePoster(card, reversed, dateLabel, line) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* ---------- 背景 ---------- */
  const bg = ctx.createLinearGradient(0, 0, W * .4, H);
  bg.addColorStop(0, '#241257');
  bg.addColorStop(.55, '#0c0726');
  bg.addColorStop(1, '#06040f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 星云
  const neb = ctx.createRadialGradient(W * .5, H * .38, 40, W * .5, H * .38, W * .85);
  neb.addColorStop(0, 'rgba(139,108,255,.30)');
  neb.addColorStop(.55, 'rgba(139,108,255,.07)');
  neb.addColorStop(1, 'rgba(139,108,255,0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  // 底部暖光
  const glow = ctx.createRadialGradient(W * .5, H * 1.02, 20, W * .5, H * 1.02, W * .8);
  glow.addColorStop(0, 'rgba(243,209,154,.16)');
  glow.addColorStop(1, 'rgba(243,209,154,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 星点
  for (const s of starField(card.seed * 31 + (reversed ? 7 : 3), 190, W, H)) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  }

  // 暗角
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(4,3,11,.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  /* ---------- 牌面（先画，Safari 下绘制 SVG 会污染后续状态） ---------- */
  const cw = 396, ch = 693;
  const cx = (W - cw) / 2, cy = 172;
  const img = await svgToImage(renderCard(card, artOf(card.id), { uid: '-pst' }));
  ctx.drawImage(img, cx, cy, cw, ch);
  // 牌面外发光
  ctx.save();
  ctx.shadowColor = 'rgba(243,209,154,.35)';
  ctx.shadowBlur = 40;
  ctx.strokeStyle = 'rgba(243,209,154,.32)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx + .75, cy + .75, cw - 1.5, ch - 1.5);
  ctx.restore();

  /* ---------- 画完 SVG，重置状态再做文字 ---------- */
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  const face = reversed ? card.reversed : card.upright;

  /* ---------- 顶部标识 ---------- */
  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = `300 30px ${FONT_DISPLAY}`;
  ctx.fillText('星　语', W / 2, 86);
  ctx.fillStyle = INK4;
  ctx.font = `300 15px ${FONT_BODY}`;
  ctx.fillText('S T A R L I G H T   T A R O T', W / 2, 120);

  /* ---------- 牌名 + 方向 ---------- */
  let y = cy + ch + 78;
  ctx.fillStyle = INK;
  ctx.font = `400 56px ${FONT_DISPLAY}`;
  ctx.fillText(card.name, W / 2, y);

  // 方向徽标
  y += 46;
  const dirText = reversed ? '逆 位' : '正 位';
  ctx.font = `400 22px ${FONT_DISPLAY}`;
  const dw = ctx.measureText(dirText).width;
  const bx = (W - dw - 44) / 2;
  ctx.strokeStyle = reversed ? 'rgba(127,232,255,.42)' : 'rgba(243,209,154,.45)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, bx, y - 26, dw + 44, 38, 19);
  ctx.stroke();
  ctx.fillStyle = reversed ? '#9fe4f7' : GOLD;
  ctx.fillText(dirText, W / 2, y);

  /* ---------- 关键词 ---------- */
  y += 62;
  const kw = face.kw.slice(0, 4);
  ctx.font = `400 24px ${FONT_BODY}`;
  const widths = kw.map((k) => ctx.measureText(k).width + 40);
  const gapW = 16;
  const totalW = widths.reduce((a, b) => a + b, 0) + gapW * (kw.length - 1);
  let kx = (W - totalW) / 2;
  for (let i = 0; i < kw.length; i++) {
    ctx.fillStyle = 'rgba(139,108,255,.18)';
    roundRect(ctx, kx, y - 24, widths[i], 48, 24);
    ctx.fill();
    ctx.fillStyle = '#b9a4ff';
    ctx.fillText(kw[i], kx + widths[i] / 2, y + 9);
    kx += widths[i] + gapW;
  }

  /* ---------- 解读（取前两段） ---------- */
  y += 76;
  const text = face.text.split('\n').slice(0, 2).join(' ');
  ctx.textAlign = 'left';
  ctx.fillStyle = INK2;
  ctx.font = `400 27px ${FONT_BODY}`;
  const lines = wrap(ctx, text, W - PAD * 2);
  const maxLines = 4;
  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    const last = i === maxLines - 1 && lines.length > maxLines;
    ctx.fillText(last ? lines[i].slice(0, -1) + '…' : lines[i], PAD, y);
    y += 44;
  }

  /* ---------- 底部 ---------- */
  y = H - 108;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(243,209,154,.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 46, y - 26); ctx.lineTo(W / 2 + 46, y - 26);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = `400 20px ${FONT_BODY}`;
  ctx.fillText(dateLabel, W / 2, y + 10);

  ctx.fillStyle = INK4;
  ctx.font = `400 23px ${FONT_DISPLAY}`;
  ctx.fillText(line, W / 2, y + 54);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ------------------------------------------------------------
   展示层：把 data URL 放进 <img>，供长按保存
   ------------------------------------------------------------ */
export function showPoster(url, { onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'poster';
  wrap.innerHTML = `
    <div class="poster__mask" data-close></div>
    <div class="poster__box">
      <p class="poster__tip">长按图片即可保存 · 或发送给朋友</p>
      <img class="poster__img" src="${url}" alt="星语牌面海报">
      <button class="poster__close" type="button" data-close>好的</button>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => { wrap.remove(); onClose?.(); }));
  return wrap;
}

/** 海报底部的一句诗（按牌固定） */
export function posterLine(card) {
  const L = [
    '夜色不是黑暗，是星星正在赶路。',
    '你不需要被看透，你只需要被看见。',
    '有些答案，要等你愿意慢下来才看得见。',
    '你比自己以为的更值得被温柔对待。',
    '宇宙很安静，但它一直在听。',
  ];
  const i = (card.seed || 0) % L.length;
  return L[i];
}
