/* ============================================================
   星语 · Starlight Tarot — 设置面板 / 彩蛋弹窗
   ============================================================ */

import {
  audioSettings, setSfx, setBgm, setVolume, sfx, initAudio,
  STYLE_LIST, previewStyle, currentStyle, audioStatus,
} from './core/audio.js';

/* ------------------------------------------------------------
   设置面板
   ------------------------------------------------------------ */
export function openSettings() {
  if (document.querySelector('.settings')) return;
  sfx('tap');

  const el = document.createElement('div');
  el.className = 'settings';
  el.innerHTML = `
    <div class="settings__mask" data-close></div>
    <div class="settings__box">
      <h3 class="settings__h">声音与氛围</h3>

      <div class="srow">
        <div class="srow__t">音效</div>
        <button class="switch ${audioSettings.sfx ? 'is-on' : ''}" type="button" data-k="sfx" aria-label="音效开关">
          <i></i>
        </button>
      </div>

      <div class="srow">
        <div class="srow__t">背景音</div>
        <button class="switch ${audioSettings.bgm ? 'is-on' : ''}" type="button" data-k="bgm" aria-label="背景音开关">
          <i></i>
        </button>
      </div>

      <div class="srow srow--style">
        <div class="srow__t">曲风</div>
        <div class="chips" id="styles">
          ${STYLE_LIST.map((s) =>
            `<button class="chip ${s.key === currentStyle() ? 'is-on' : ''}" type="button" data-s="${s.key}">${s.name}</button>`).join('')}
        </div>
      </div>

      <div class="srow srow--vol">
        <div class="srow__t">音量</div>
        <input class="slider" type="range" min="0" max="100" value="${Math.round(audioSettings.volume * 100)}" data-k="vol">
        <span class="srow__n" id="vnum">${Math.round(audioSettings.volume * 100)}</span>
      </div>

      <div class="settings__state" id="aState"></div>

      <p class="settings__note" id="aNote"></p>
      <button class="act act--ghost settings__ok" type="button" data-close>好了</button>
    </div>`;

  document.body.appendChild(el);

  /* 音频状态：告诉用户到底是"没开"还是"被静音了" */
  const st = audioStatus();
  const stateEl = el.querySelector('#aState');
  const noteEl = el.querySelector('#aNote');
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  if (st.ready && !st.blocked) {
    stateEl.className = 'settings__state is-ok';
    stateEl.textContent = '● 声音已开启';
    noteEl.innerHTML = '所有声音都是实时合成的，没有加载任何音频文件。';
  } else if (st.blocked) {
    stateEl.className = 'settings__state is-bad';
    stateEl.textContent = '● 声音被系统拦截了';
    noteEl.innerHTML = '如果是 iPhone，请把侧边的<b>静音开关</b>拨到响铃位置。<br>网页音频会受它控制。';
  } else {
    stateEl.className = 'settings__state is-idle';
    stateEl.textContent = '● 声音尚未开启';
    noteEl.innerHTML = isIOS
      ? '声音需要你主动点一下才会开始，<br>苹果不允许网页自动出声。<br>回到页面随便点一下就好。'
      : '随便点一下页面，声音就会开始。';
  }

  el.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => { sfx('tap'); el.remove(); }));

  el.querySelectorAll('.switch').forEach((b) => {
    b.addEventListener('click', () => {
      const on = !b.classList.contains('is-on');
      b.classList.toggle('is-on', on);
      if (b.dataset.k === 'sfx') { setSfx(on); sfx('tap'); }
      else { setBgm(on); if (on) sfx('reveal'); }
    });
  });

  el.querySelectorAll('#styles .chip').forEach((c) => {
    c.addEventListener('click', () => {
      el.querySelectorAll('#styles .chip').forEach((x) => x.classList.remove('is-on'));
      c.classList.add('is-on');
      previewStyle(c.dataset.s, 10);   // 试听 10 秒
    });
  });

  const vol = el.querySelector('.slider');
  const num = el.querySelector('#vnum');
  vol.addEventListener('input', () => {
    num.textContent = vol.value;
    setVolume(Number(vol.value) / 100);
  });
  vol.addEventListener('change', () => sfx('tap'));
}

/* ------------------------------------------------------------
   彩蛋弹窗：抽到稀有牌 / 触发组合时出现
   ------------------------------------------------------------ */
export function showEgg({ tag, name, line }, onDone) {
  if (document.querySelector('.egg')) return;
  sfx('egg');

  const el = document.createElement('div');
  el.className = 'egg';
  el.innerHTML = `
    <div class="egg__box">
      <div class="egg__glow" aria-hidden="true"></div>
      ${Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return `<i class="egg__spark" style="--a:${a}rad;--d:${0.35 + (i % 4) * 0.09}s"></i>`;
      }).join('')}
      <div class="egg__tag">✦ ${tag}</div>
      <div class="egg__name">${name}</div>
      <p class="egg__line">${line.replace(/\n/g, '<br>')}</p>
    </div>`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => { el.remove(); onDone?.(); }, 700);
  }, 3200);
}
