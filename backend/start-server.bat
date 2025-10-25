@echo off
REM Supa Dillie-Cious Mart Backend Startup
echo Starting Supa Dillie-Cious Mart Backend...
cd /d "%~dp0"
echo Working directory: %CD%
node server.js
