@echo off
title SmartCart AI - Full Stack Launcher
echo ===================================================
echo     SmartCart AI - Intelligent E-Commerce Platform
echo ===================================================
echo.

echo [1/2] Starting Backend Server on http://127.0.0.1:5000 ...
start "SmartCart Backend (Flask)" cmd /k "cd /d %~dp0 && backend\venv\Scripts\python backend\app.py"

echo [2/2] Starting Frontend Dev Server on http://localhost:5173 ...
start "SmartCart Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   SmartCart AI is launching!
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:5000/api/health
echo.
echo   Demo Admin    : admin@smartcart.ai  /  Admin@123
echo   Demo Customer : user@smartcart.ai   /  User@123
echo ===================================================
pause
