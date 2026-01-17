#!/bin/bash
echo "==========================================="
echo "  Desktop Tool 完全重启脚本"
echo "==========================================="
echo ""

echo "1️⃣  关闭所有应用进程..."
pkill -9 -f "electron.*desktop-tool" 2>/dev/null
pkill -9 -f "vite.*desktop-tool" 2>/dev/null
sleep 2
echo "   ✓ 所有进程已关闭"
echo ""

echo "2️⃣  清除缓存..."
rm -rf node_modules/.vite
echo "   ✓ Vite 缓存已清除"
echo ""

echo "3️⃣  启动应用..."
echo "   📌 开发者工具将自动打开"
echo "   📌 按下 F12 可以切换开发者工具"
echo ""
npm run dev
