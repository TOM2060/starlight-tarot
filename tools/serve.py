#!/usr/bin/env python3
"""
星语 · Starlight Tarot —— 本地预览服务器

比 `python -m http.server` 多做两件事，都是为了让"改完刷新就生效"真的成立：

  1. 所有响应带 Cache-Control: no-store
     iOS Safari 对 ES Module 的缓存极其激进，不加这个头，
     你在手机上刷新多少次都可能还在跑旧代码，然后误以为改动没生效。

  2. 自动探测并打印所有可用的访问地址
     换 WiFi 后不用自己查 IP。

用法：
    ./tools/serve.sh            # 默认 8123 端口
    ./tools/serve.sh 9000       # 指定端口
"""

import http.server
import socket
import socketserver
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        # 开发期禁用一切缓存，保证刷新即最新
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, k, v):
        # 去掉 SimpleHTTPRequestHandler 默认的 Last-Modified，避免 304
        if k == "Last-Modified":
            return
        super().send_header(k, v)

    def log_message(self, fmt, *args):
        # 只记录非 200 的请求，安静一点
        if not str(args[1] if len(args) > 1 else "").startswith("2"):
            sys.stderr.write("  %s\n" % (fmt % args))


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except Exception:
        return None
    finally:
        s.close()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    ip = lan_ip()
    print()
    print("  ╭──────────────────────────────────────────────╮")
    print("  │   星语 · Starlight Tarot  ·  本地预览          │")
    print("  ╰──────────────────────────────────────────────╯")
    print()
    print(f"  电脑     http://127.0.0.1:{PORT}/")
    if ip:
        print(f"  手机     http://{ip}:{PORT}/        ← 需同一 WiFi")
    print()
    print("  牌面预览 http://127.0.0.1:%d/tools/cards.html" % PORT)
    print("  曲风试听 http://127.0.0.1:%d/tools/music.html" % PORT)
    print("  牌面巡检 http://127.0.0.1:%d/tools/audit.html" % PORT)
    print()
    print("  改完代码，手机上刷新页面即可（已禁用缓存）。")
    print("  首次访问若没有声音：随便点一下页面。")
    print("  Ctrl+C 停止。")
    print()

    with Server(("0.0.0.0", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  已停止。\n")
