@echo off
title DuckDNS SERVER DOMAIN

set DOMAIN=backendvdocs
set TOKEN=d71c1ac4-6b62-452d-8139-1ae9caf32164

echo ===============================
echo DuckDNS SERVER DOMAIN AUTO UPDATE STARTED
echo Domain: %DOMAIN%.duckdns.org
echo Interval: 5 minutes
echo ===============================

:loop
for /f %%i in ('curl -s "https://www.duckdns.org/update?domains=%DOMAIN%&token=%TOKEN%&ip="') do set RESULT=%%i

echo.
echo [%DATE% %TIME%] DuckDNS response: %RESULT%

timeout /t 300 > nul
goto loop
