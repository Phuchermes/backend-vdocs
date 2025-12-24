@echo off
setlocal EnableExtensions EnableDelayedExpansion
title STORAGE VIAGS V-DOCS

REM ================== CONFIG ==================
set BASE_DIR=C:\V-Docs_Backend

REM --- NGINX ---
set NGINX_DIR=%BASE_DIR%\nginx
set NGINX_EXE=%NGINX_DIR%\nginx.exe

REM --- NODE ---
set NODE_EXE=%BASE_DIR%\node.exe
set ENTRY=index.js
set PORT=3000

REM --- LOG ---
set LOG_DIR=%BASE_DIR%\logs
set LOG_FILE=%LOG_DIR%\backend.log

REM --- TIMING ---
set KEEPALIVE_SEC=300
set RESTART_DELAY=5
REM ============================================

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ================================================== >> "%LOG_FILE%"
echo [%DATE% %TIME%] SYSTEM BOOT >> "%LOG_FILE%"
echo ================================================== >> "%LOG_FILE%"

REM ================= WAIT NETWORK =================
:waitnet
ping 8.8.8.8 -n 1 > nul
if errorlevel 1 (
    echo [%DATE% %TIME%] Waiting network... >> "%LOG_FILE%"
    timeout /t 5 > nul
    goto waitnet
)

REM ================= START NGINX =================
:start_nginx
tasklist | findstr /i "nginx.exe" > nul
if errorlevel 1 (
    echo [%DATE% %TIME%] START NGINX >> "%LOG_FILE%"
    start "" "%NGINX_EXE%" -p "%NGINX_DIR%"
    timeout /t 3 > nul
)

REM ================= START / RESTART BACKEND =================
:start_backend
echo [%DATE% %TIME%] START BACKEND >> "%LOG_FILE%"

REM Kill process keep port
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT%') do (
    echo [%DATE% %TIME%] Kill PID %%p >> "%LOG_FILE%"
    taskkill /PID %%p /F > nul 2>&1
)

cd /d "%BASE_DIR%"
start "" /b "%NODE_EXE%" "%ENTRY%" >> "%LOG_FILE%" 2>&1

REM ================= KEEPALIVE LOOP =================
:keepalive
timeout /t %KEEPALIVE_SEC% > nul

REM ---- CHECK NGINX ----
tasklist | findstr /i "nginx.exe" > nul
if errorlevel 1 (
    echo [%DATE% %TIME%] NGINX DOWN - RESTART >> "%LOG_FILE%"
    goto start_nginx
)

REM ---- CHECK BACKEND HEALTH ----
curl http://127.0.0.1:3000/health > nul 2>&1
if errorlevel 1 goto restart_backend

curl -k https://backendvdocs.duckdns.org/health > nul 2>&1
if errorlevel 1 goto restart_nginx


REM ---- CHECK NODE PROCESS ----
tasklist | findstr /i "node.exe" > nul
if errorlevel 1 (
    echo [%DATE% %TIME%] NODE PROCESS LOST - RESTART >> "%LOG_FILE%"
    timeout /t %RESTART_DELAY% > nul
    goto start_backend
)

echo [%DATE% %TIME%] keepalive OK >> "%LOG_FILE%"
goto keepalive
