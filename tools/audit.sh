#!/bin/bash
# ============================================================
# 星语 · Starlight Tarot —— 牌面自动巡检
# 逐张把牌渲染成位图，按像素亮度判断是否"空白牌"。
# 用法: ./tools/audit.sh
# ============================================================
set -e
cd "$(dirname "$0")/.."
PORT="${AUDIT_PORT:-8123}"
BIN=/Users/yizhou/Documents/deepseek-harness/default-workspace/.pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell

"$BIN" --headless --no-sandbox --disable-gpu --use-gl=swiftshader \
  --user-data-dir=/tmp/sl-audit \
  --window-size=1000,900 --virtual-time-budget=25000 \
  --dump-dom "http://127.0.0.1:$PORT/tools/audit.html" 2>/dev/null \
  | sed -n '/<div id="out"/,/<\/div>/p' \
  | sed 's/<[^>]*>//g' | sed 's/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g' \
  | sed '/^[[:space:]]*$/d'
