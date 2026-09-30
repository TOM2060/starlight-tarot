#!/bin/bash
# ============================================================
# 星语 · Starlight Tarot —— 一键推送到 GitHub 并开启 Pages
#
# 用法：先在 GitHub 网页新建一个空仓库（不要勾选 README），
#       然后运行：./tools/deploy.sh
# 会依次询问：GitHub 用户名、仓库名、Personal Access Token
# ============================================================
set -e
cd "$(dirname "$0")/.."

echo "════════════════════════════════════════════════"
echo "  星语 · Starlight Tarot  部署到 GitHub Pages"
echo "════════════════════════════════════════════════"
echo
echo "① 打开 https://github.com/new 新建一个仓库"
echo "   仓库名建议：starlight-tarot"
echo "   ⚠️  勾选项全部取消（不要 README / .gitignore / License）"
echo "   ⚠️  可见性选 Public（Pages 免费版需要公开仓库）"
echo
echo "② 生成 Token："
echo "   打开 https://github.com/settings/tokens/new"
echo "   Note 随便填，Expiration 选 30 days"
echo "   ⚠️ 勾选 repo 权限，然后拉到最下面点 Generate token"
echo "   复制那串 ghp_...（只会显示一次）"
echo

read -rp "GitHub 用户名（例如 yizhou）: " GH_USER
read -rp "仓库名（例如 starlight-tarot）: " GH_REPO
read -rsp "Personal Access Token（输入不显示）: " GH_TOKEN
echo

[ -z "$GH_USER" ] || [ -z "$GH_REPO" ] || [ -z "$GH_TOKEN" ] && {
  echo "信息不完整，已取消。"; exit 1;
}

echo "③ 推送代码…"
git checkout -q main 2>/dev/null || git checkout -q master
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GH_USER/$GH_REPO.git"

# 用一次性凭据推送，不写入配置
ASKPASS=$(mktemp -d)
cat > "$ASKPASS/askpass.sh" <<'AP'
#!/bin/sh
echo "$GITHUB_TOKEN"
AP
chmod +x "$ASKPASS/askpass.sh"
GITHUB_TOKEN="$GH_TOKEN" GIT_ASKPASS="$ASKPASS/askpass.sh" GIT_TERMINAL_PROMPT=0 \
  git push -u origin HEAD:refs/heads/main --force
rm -rf "$ASKPASS"

echo
echo "④ 最后一步（需要你在网页点两下）："
echo "   打开 https://github.com/$GH_USER/$GH_REPO/settings/pages"
echo "   Source 下拉框选：Deploy from a branch"
echo "   Branch 选：main    /  Folder 选：/ (root)"
echo "   点 Save"
echo
echo "════════════════════════════════════════════════"
echo "  大约 1 分钟后，你的地址是："
echo "  https://$GH_USER.github.io/$GH_REPO/"
echo "════════════════════════════════════════════════"
echo
echo "  若想改成 github.io 根地址（不带仓库名）："
echo "  仓库名必须是 $GH_USER.github.io 才能做到"
echo "  当前仓库名是 $GH_REPO，所以地址带 /$GH_REPO/，一样能用。"
