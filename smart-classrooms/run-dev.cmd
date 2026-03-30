@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm.cmd install
  if errorlevel 1 exit /b %errorlevel%
)

call npm.cmd run dev -- --host 127.0.0.1 --port 5173
