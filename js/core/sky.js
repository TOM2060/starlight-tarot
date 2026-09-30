/* ============================================================
   星语 · Starlight Tarot — 星空粒子系统
   三层视差星点 + 随机流星 + 呼吸闪烁
   纯 Canvas 2D，无依赖，移动端优化
   ============================================================ */

const TAU = Math.PI * 2;

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/** 星点色温：白 / 淡紫 / 淡金 / 淡蓝 */
const STAR_TINTS = [
  { fill: '255,255,255', w: 52 },
  { fill: '214,198,255', w: 24 },
  { fill: '255,226,180', w: 16 },
  { fill: '186,222,255', w: 8 },
];

function pickTint() {
  const total = STAR_TINTS.reduce((s, t) => s + t.w, 0);
  let r = Math.random() * total;
  for (const t of STAR_TINTS) {
    r -= t.w;
    if (r <= 0) return t.fill;
  }
  return '255,255,255';
}

/* ------------------------------------------------------------
   单颗星
   ------------------------------------------------------------ */
class Star {
  constructor(w, h, depth) {
    this.depth = depth;                 // 0 = 最远层，1 = 最近层
    this.reset(w, h, true);
  }

  reset(w, h, initial = false) {
    this.x = rand(0, w);
    this.y = initial ? rand(0, h) : rand(-0.05 * h, 0.02 * h);
    this.r = rand(0.45, 1.05) + this.depth * rand(0, 0.85);
    this.tint = pickTint();

    const layerAlpha = 0.3 + this.depth * 0.55;
    this.baseAlpha = rand(0.25, 0.95) * layerAlpha;
    this.alpha = initial ? this.baseAlpha : 0;

    // 闪烁：幅度越大、速度越慢，看起来越像远处的星
    this.twSpeed = rand(0.4, 1.5) * (1.25 - this.depth * 0.6);
    this.twPhase = rand(0, TAU);
    this.twAmount = rand(0.18, 0.62) * (1 - this.depth * 0.35);

    // 极缓慢的自转漂移
    this.driftX = rand(-0.012, 0.012) * (0.4 + this.depth);
    this.driftY = rand(0.004, 0.03) * (0.3 + this.depth);
  }

  update(dt, w, h) {
    // 淡入
    if (this.alpha < this.baseAlpha) {
      this.alpha = Math.min(this.baseAlpha, this.alpha + dt * 0.8);
    }

    // 闪烁
    this.twPhase += dt * this.twSpeed;
    const tw = 1 - this.twAmount * (0.5 + 0.5 * Math.sin(this.twPhase));

    // 漂移
    this.x += this.driftX * dt;
    this.y += this.driftY * dt;

    // 出界回收
    if (this.y > h + 4 || this.x < -6 || this.x > w + 6) this.reset(w, h);

    return tw;
  }
}

/* ------------------------------------------------------------
   流星
   ------------------------------------------------------------ */
class Meteor {
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    // 从上方或左上方进入，朝右下方划过
    this.x = rand(-0.1 * w, 0.85 * w);
    this.y = rand(-0.05 * h, 0.45 * h);

    const angle = rand(0.32, 0.62);         // 弧度，略微向下
    this.vx = Math.cos(angle) * rand(2.6, 4.4);
    this.vy = Math.sin(angle) * rand(2.6, 4.4);

    this.len  = rand(90, 220);
    this.life = 0;
    this.max  = rand(60, 105);
    this.tint = pick(['255,255,255', '214,198,255', '255,226,180']);
  }

  update(dt) {
    this.x += this.vx * 60 * dt;
    this.y += this.vy * 60 * dt;
    this.life += dt;
    return this.life < this.max;
  }

  /** 透明度包络：快速亮起 → 长尾渐隐 */
  get opacity() {
    const p = this.life / this.max;
    return p < 0.18 ? p / 0.18 : 1 - (p - 0.18) / 0.82;
  }
}

/* ------------------------------------------------------------
   星空系统
   ------------------------------------------------------------ */
export class Sky {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });

    this.stars = [];
    this.meteors = [];
    this.meteorTimer = rand(2, 5);

    this.last = performance.now();
    this.running = false;
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();

    // 视口变化时重建布局
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('orientationchange', this.resize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('orientationchange', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  onVisibility() {
    // 切到后台时停掉渲染，省电；回到前台再续上
    if (document.hidden) {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    } else if (this.running && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.w = w;
    this.h = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 星点密度随面积增长，但设上限保护低端机
    const area = (w * h) / (dpr * 1e6);
    const target = Math.min(240, Math.round(78 + area * 62));

    if (this.stars.length === 0) {
      for (let i = 0; i < target; i++) {
        this.stars.push(new Star(w, h, i / target));
      }
    } else if (this.stars.length > target) {
      this.stars.length = target;
    } else {
      while (this.stars.length < target) {
        this.stars.push(new Star(w, h, Math.random()));
      }
    }
  }

  loop(now) {
    if (!this.running) return;

    // dt 上限 1/30 秒，避免切回前台时"瞬移"
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;

    this.draw(dt);
    this.raf = requestAnimationFrame(this.loop);
  }

  draw(dt) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    /* ---- 星点 ---- */
    for (const s of this.stars) {
      const tw = s.update(dt, w, h);
      const a = s.alpha * tw;
      if (a <= 0.01) continue;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fillStyle = `rgba(${s.tint},${a})`;
      ctx.fill();

      // 最亮的一批加十字星芒
      if (s.r > 1.25 && a > 0.55) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
        g.addColorStop(0, `rgba(${s.tint},${a * 0.5})`);
        g.addColorStop(1, `rgba(${s.tint},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 7, 0, TAU);
        ctx.fill();
      }
    }

    /* ---- 流星 ---- */
    this.meteorTimer -= dt;
    if (this.meteorTimer <= 0) {
      this.meteors.push(new Meteor(w, h));
      this.meteorTimer = rand(4, 11);
    }

    ctx.lineCap = 'round';
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      if (!m.update(dt)) { this.meteors.splice(i, 1); continue; }

      const tail = m.len * m.opacity;
      const nx = m.x - m.vx * 12, ny = m.y - m.vy * 12;
      const gx = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * tail;
      const gy = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * tail;

      const grad = ctx.createLinearGradient(gx, gy, nx, ny);
      grad.addColorStop(0, `rgba(${m.tint},0)`);
      grad.addColorStop(1, `rgba(${m.tint},${m.opacity * 0.85})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // 头部光点
      ctx.beginPath();
      ctx.arc(nx, ny, 1.4, 0, TAU);
      ctx.fillStyle = `rgba(${m.tint},${m.opacity})`;
      ctx.fill();
    }
  }
}
