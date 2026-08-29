#!/usr/bin/env sh
# 云栖小筑 · Mizuki 管理后台启动脚本
# 本脚本可放在任意位置运行（博客仓库内任意目录、或仓库外），例如：./start-admin.sh
# 会自动定位博客根目录、处理端口冲突，并在服务就绪后打开浏览器。
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=""

# 1) 环境变量 MIZUKI_ROOT
if [ -n "${MIZUKI_ROOT:-}" ] && [ -f "$MIZUKI_ROOT/scripts/start-admin.mjs" ]; then
  ROOT=$MIZUKI_ROOT
fi

# 2) 本脚本所在目录
if [ -z "$ROOT" ] && [ -f "$SCRIPT_DIR/scripts/start-admin.mjs" ]; then
  ROOT=$SCRIPT_DIR
fi

# 3) 从本脚本所在目录向上逐级查找
if [ -z "$ROOT" ]; then
  CUR=$SCRIPT_DIR
  while [ "$CUR" != "/" ]; do
    if [ -f "$CUR/scripts/start-admin.mjs" ]; then
      ROOT=$CUR
      break
    fi
    CUR=$(dirname "$CUR")
  done
fi

# 4) 本脚本同目录下的 mizuki-root.txt（脚本放在仓库外时，在其中写入仓库根目录路径）
if [ -z "$ROOT" ] && [ -f "$SCRIPT_DIR/mizuki-root.txt" ]; then
  HINT=$(tr -d '\r\n' < "$SCRIPT_DIR/mizuki-root.txt")
  if [ -n "$HINT" ] && [ -f "$HINT/scripts/start-admin.mjs" ]; then
    ROOT=$HINT
  fi
fi

# 5) 用户主目录下的 .mizuki-root.txt（与脚本位置无关的兜底定位）
if [ -z "$ROOT" ] && [ -f "$HOME/.mizuki-root.txt" ]; then
  HINT=$(tr -d '\r\n' < "$HOME/.mizuki-root.txt")
  if [ -n "$HINT" ] && [ -f "$HINT/scripts/start-admin.mjs" ]; then
    ROOT=$HINT
  fi
fi

if [ -z "$ROOT" ]; then
  echo "[错误] 未找到博客根目录。" >&2
  echo "请将脚本放在博客仓库（Mizuki）中任意目录运行；若放在仓库外，请：" >&2
  echo "  1. 在脚本同目录创建 mizuki-root.txt，内容写入仓库根目录路径；或" >&2
  echo "  2. 在用户主目录创建 ~/.mizuki-root.txt，内容写入仓库根目录路径；或" >&2
  echo "  3. 设置环境变量 MIZUKI_ROOT 指向仓库根目录。" >&2
  exit 1
fi

NODE_BIN=$(command -v node || command -v nodejs || true)
if [ -z "$NODE_BIN" ]; then
  echo "[错误] 未找到 Node.js，请先安装 Node.js >= 20（https://nodejs.org/）。" >&2
  exit 1
fi

export MIZUKI_ROOT="$ROOT"
exec "$NODE_BIN" "$ROOT/scripts/start-admin.mjs" "$@"
