@echo on
setlocal EnableExtensions EnableDelayedExpansion
title V-DOCS BACKEND (NODE ONLY)

REM ================= CONFIG =================
set BASE_DIR=C:\V-Docs_Backend
set ENTRY=index.js
set PORT=3000

REM --- LOG ---
set LOG_DIR=%BASE_DIR%\logs
set NODE_LOG=%LOG_DIR%\node.log
set LOG_MAX_SIZE=104857600  REM 100MB

REM --- TIMING ---
set CHECK_INTERVAL=60
set RESTART_DELAY=5
REM ==========================================

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ================================================== >> "%NODE_LOG%"
echo [%DATE% %TIME%] SYSTEM BOOT >> "%NODE_LOG%"
echo ================================================== >> "%NODE_LOG%"

REM ===== LOG ROTATE FUNCTION =====
:log_rotate
for %%F in ("%NODE_LOG%") do (
    if exist "%%F" (
        for %%A in (%%F) do set size=%%~zA
        if !size! geq %LOG_MAX_SIZE% (
            echo [%DATE% %TIME%] ROTATING LOG %%F >> "%NODE_LOG%"
            move /Y "%%F" "%%F.old" > nul
            type nul > "%%F"
        )
    )
)
goto :eof

REM ===== START NODE WITH PM2 CLUSTER =====
:start_node
cd /d "%BASE_DIR%"

pm2 describe vdocs-backend > nul 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] START NODE (PM2 CLUSTER) >> "%NODE_LOG%"
    pm2 start "%ENTRY%" -i max --name "vdocs-backend" --log "%NODE_LOG%" --time
    pm2 save
) else (
    echo [%DATE% %TIME%] NODE ALREADY RUNNING, RELOAD >> "%NODE_LOG%"
    pm2 reload "vdocs-backend"
)

REM ===== KEEPALIVE LOOP =====
:keepalive
timeout /t %CHECK_INTERVAL% > nul

REM --- LOG ROTATE ---
call :log_rotate

REM --- CHECK NODE ---
pm2 describe vdocs-backend > nul 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] NODE PROCESS LOST >> "%NODE_LOG%"
    timeout /t %RESTART_DELAY% > nul
    goto start_node
)

REM --- CHECK HEALTH ---
powershell -Command "try {Invoke-WebRequest http://127.0.0.1:%PORT%/health -TimeoutSec 5} catch {exit 1}"
if errorlevel 1 (
    echo [%DATE% %TIME%] HEALTH FAIL, RESTART NODE >> "%NODE_LOG%"
    pm2 restart "vdocs-backend"
) else (
    echo [%DATE% %TIME%] HEALTH OK >> "%NODE_LOG%"
)

goto keepalive
