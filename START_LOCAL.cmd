@echo off
setlocal
chcp 65001 >nul
title Naesaju Local Launcher

set "PROJECT_DIR=D:\saju"
set "LOCAL_URL=http://127.0.0.1:5173"

if not exist "%PROJECT_DIR%\package.json" (
  echo [ERROR] Local project was not found at %PROJECT_DIR%.
  echo Expected file: %PROJECT_DIR%\package.json
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

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
  echo Expected project folder: %PROJECT_DIR%.
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
start "Naesaju Local Server" /D "%PROJECT_DIR%" cmd /k "npm run dev:local"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='%LOCAL_URL%'; for($i=0; $i -lt 60; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 1; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ Start-Process $u; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; exit 1"

if errorlevel 1 (
  echo [WARN] The server window was opened, but automatic browser launch timed out.
  echo Open %LOCAL_URL% manually after the server finishes starting.
  start "" "%LOCAL_URL%"
)

exit /b 0
