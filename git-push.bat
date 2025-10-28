@echo off
echo Pushing JARVIS OMEGA PROTOCOL to GitHub...
echo.

git commit -m "Initial commit - JARVIS OMEGA PROTOCOL"
git remote add origin https://github.com/lalith-sky/automationhackathon.git
git branch -M main
git push -u origin main

echo.
echo Done!
pause
