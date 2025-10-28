@echo off
echo Opening JARVIS OMEGA PROTOCOL pages...
echo.

start http://localhost:5000/login
timeout /t 1 /nobreak >nul

start http://localhost:5000/signup
timeout /t 1 /nobreak >nul

start http://localhost:5000/test.html

echo.
echo Pages opened in your browser!
echo.
echo Available pages:
echo - Login: http://localhost:5000/login
echo - Register: http://localhost:5000/signup
echo - Test Page: http://localhost:5000/test.html
echo - Dashboard: http://localhost:5000/
echo.
pause
