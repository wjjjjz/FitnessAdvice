#!/bin/bash

echo "========================================"
echo "  AI健身建议生成器 - 启动脚本"
echo "========================================"
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null
then
    echo "[错误] 未检测到Python，请先安装Python"
    echo "下载地址: https://www.python.org/downloads/"
    exit 1
fi

echo "[信息] 正在启动本地服务器..."
echo "[信息] 服务器地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 可停止服务器"
echo "========================================"
echo ""

# 尝试打开浏览器
if command -v xdg-open &> /dev/null
then
    xdg-open http://localhost:8000 &
elif command -v open &> /dev/null
then
    open http://localhost:8000 &
fi

# 启动Python HTTP服务器
if command -v python3 &> /dev/null
then
    python3 -m http.server 8000
else
    python -m http.server 8000
fi

