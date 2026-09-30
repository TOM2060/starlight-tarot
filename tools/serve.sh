#!/bin/bash
# 星语 · Starlight Tarot —— 本地预览入口
cd "$(dirname "$0")/.."
PY="/Users/yizhou/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3"
[ -x "$PY" ] || PY="$(command -v python3)"
exec "$PY" tools/serve.py "${1:-8123}"
