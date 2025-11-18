@echo off
echo ========================================
echo   AI健身建议生成器 - 启动脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [信息] 正在启动本地服务器...
echo [信息] 服务器地址: http://localhost:8000
echo.
echo 按 Ctrl+C 可停止服务器
echo ========================================
echo.

REM 启动浏览器
start http://localhost:8000

REM 启动Python HTTP服务器
python -m http.server 8000

