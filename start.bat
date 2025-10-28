@echo off
echo Starting J.A.R.V.I.S AI Dashboard...
echo.

echo Starting Backend Server...
cd backend
start cmd /k "npm install && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
cd ..\frontend
start cmd /k "npx http-server . -p 3000 -o"

echo.
echo J.A.R.V.I.S AI Dashboard is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
