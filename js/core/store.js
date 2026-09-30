/* ============================================================
   星语 · Starlight Tarot — 本地存储
   全部数据留在玩家手机里，不上传、不需要账号
   ============================================================ */

const KEY = 'starlight-tarot:v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // 隐私模式或存储已满：静默降级为"仅本次会话"
    console.warn('[store] 写入失败', e);
  }
}

const cache = read();

export const store = {
  get(path, fallback = null) {
    return path.split('.').reduce(
      (o, k) => (o == null ? o : o[k]),
      cache,
    ) ?? fallback;
  },

  set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] ??= {}), cache);
    target[last] = value;
    write(cache);
    return value;
  },

  /** 局部合并（对象） */
  merge(path, patch) {
    const cur = this.get(path, {}) || {};
    return this.set(path, { ...cur, ...patch });
  },

  push(path, item) {
    const arr = this.get(path, []) || [];
    arr.unshift(item);
    // 记录本最多保留 300 条，避免长期使用撑爆存储
    return this.set(path, arr.slice(0, 300));
  },

  all() { return { ...cache }; },
};

/* ------------------------------------------------------------
   常用字段的便捷读取
   ------------------------------------------------------------ */
export const todayKey = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
