#!/bin/bash
# ============================================================
# 星语 · Starlight Tarot —— 本地预览服务器
# 启动后可用电脑和手机（同一 WiFi）同时访问
# ============================================================
set -e
cd "$(dirname "$0")/.."

PORT="${1:-8123}"
PY="/Users/yizhou/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3"
[ -x "$PY" ] || PY="$(command -v python3)"

# 取本机局域网 IP（按优先级试网卡）
IP=""
for IF in en0 en1 en2; do
  IP="$(ipconfig getifaddr $IF 2>/dev/null || true)"
  [ -n "$IP" ] && break
done
if [ -z "$IP" ]; then
  IP="$(ifconfig 2>/dev/null | awk '/inet /{print $2}' | grep -v '^127\.' | head -1)"
fi

echo "════════════════════════════════════════"
echo "  星语 · Starlight Tarot"
echo "════════════════════════════════════════"
echo "  电脑访问：  http://127.0.0.1:$PORT/"
echo "  手机访问：  http://$IP:$PORT/"
echo "  牌面预览：  http://127.0.0.1:$PORT/tools/cards.html"
echo "════════════════════════════════════════"
echo "  手机需与电脑连同一个 WiFi。"
echo "  按 Ctrl+C 停止。"
echo ""

exec "$PY" -m http.server "$PORT" --bind 0.0.0.0 --directory .
