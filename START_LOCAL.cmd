@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Naesaju Local Launcher

set "LOCAL_URL=http://127.0.0.1:5173"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Install Node.js LTS and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not available.
  echo Reinstall Node.js LTS and run this file again.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json was not found.
  echo Keep START_LOCAL.cmd in the repository root folder.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo [INFO] Installing dependencies for first launch...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [INFO] Starting Naesaju local server at %LOCAL_URL%
start "Naesaju Local Server" /D "%~dp0" cmd /k "npm run dev:local"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='%LOCAL_URL%'; for($i=0; $i -lt 60; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 1; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ Start-Process $u; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; exit 1"

if errorlevel 1 (
  echo [WARN] The server window was opened, but automatic browser launch timed out.
  echo Open %LOCAL_URL% manually after the server finishes starting.
  start "" "%LOCAL_URL%"
)

exit /b 0
