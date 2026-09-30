/* ============================================================
   星语 · Starlight Tarot — 应用入口
   ============================================================ */

import { Sky } from './core/sky.js';
import { renderHome } from './views/home.js';
import { renderDraw } from './views/draw.js';
import { renderDaily } from './views/daily.js';
import { renderMood } from './views/mood.js';
import { renderBook } from './views/book.js';
import { renderQuest } from './views/quest.js';
import { renderAtlas } from './views/atlas.js';
import { store } from './core/store.js';
import { armAudio, sfx, initAudio } from './core/audio.js';
import { openSettings } from './ui.js';
import { nightMode, nightLine } from './core/eggs.js';

const app = document.getElementById('app');

/* ---------- 离线：仅在安全上下文下注册 ---------- */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* 注册失败不影响使用，只是没有离线能力 */
    });
  });
}

/* ---------- 音频：必须等用户第一次触碰才能启动（浏览器限制） ---------- */
armAudio();

/* ---------- 星空背景 ---------- */
const sky = new Sky(document.getElementById('sky-canvas'));
sky.start();

/* ---------- 首次进入的欢迎语 ---------- */
if (!store.get('welcomed')) {
  store.set('welcomed', true);
  setTimeout(() => toast('星光已为你亮起'), 1400);
} else if (nightMode()) {
  setTimeout(() => toast(nightLine(), 3600), 900);
}

/* ---------- 轻提示 ---------- */
let toastTimer = null;
export function toast(text, ms = 2200) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('toast--on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('toast--on'), ms);
}

/* ---------- 视图切换 ---------- */
function showHome() {
  app.innerHTML = '';
  renderHome(app, { onSelect: go });
}

function showDraw() {
  renderDraw(app, {
    onBack: showHome,
    onSaved: () => toast('已收进记录本 ✦'),
    onPoster: () => toast('长按图片即可保存 ✦'),
  });
}

function showDaily() {
  renderDaily(app, {
    onBack: showHome,
    onRecord: showBook,

  });
}

function showMood() {
  renderMood(app, { onBack: showHome });
}

function showBook() {
  renderBook(app, {
    onBack: showHome,
    onDraw: showDraw,
    onCheckIn: showMood,
  });
}

function showQuest() {
  const no = new URLSearchParams(location.search).get('no');
  renderQuest(app, { onBack: showHome, onToast: (t) => toast(t), startAt: no && Number(no) });
}

function showAtlas() {
  renderAtlas(app, { onBack: showHome });
}

const ROUTES = {
  settings: openSettings,
  atlas: showAtlas,
  draw:  showDraw,
  free:  showDraw,
  today: showDaily,
  mood:  showMood,
  quest: showQuest,
  book:  showBook,
};

function go(name) {
  if (name === 'settings') { openSettings(); return; }
  sfx('page');
  ROUTES[name]?.();
}

/* ---------- 启动：支持 ?v=book 这样的深链接 ---------- */
const deep = new URLSearchParams(location.search).get('v');
if (deep && ROUTES[deep]) go(deep);
else showHome();

// 调试用
window.__starlight = { sky, go, showHome, showBook, showDaily, showMood };
