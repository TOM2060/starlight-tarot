#!/bin/bash
# 用无头 Chromium 给星语页面截图
# 用法: ./shot.sh <名称> <路径> [宽] [高] [等待毫秒]
set -e
BIN=/Users/yizhou/Documents/deepseek-harness/default-workspace/.pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell
NAME=${1:-shot}
PAGE=${2:-/}
W=${3:-390}
H=${4:-844}
WAIT=${5:-4000}
OUT=/tmp/slshots/$NAME.png
mkdir -p /tmp/slshots
"$BIN" --headless --no-sandbox --disable-gpu --use-gl=swiftshader \
  --hide-scrollbars --force-device-scale-factor=2 --user-data-dir=/tmp/sl-chrome-$NAME \
  --window-size=$W,$H --virtual-time-budget=$WAIT \
  --screenshot="$OUT" "http://127.0.0.1:8123$PAGE" 2>/dev/null
echo "$OUT"
