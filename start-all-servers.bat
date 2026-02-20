@echo off
echo Starting OOES Office Management System...
echo.

echo Starting Main Dashboard Server (Port 3002)...
start "Main Dashboard" cmd /k "cd /d C:\Users\HP\CascadeProjects\office-sort && python simple-server.py"

echo Waiting 3 seconds for main server to start...
timeout /t 3 /nobreak >nul

echo Starting Accountant Portal Server (Port 3003)...
start "Accountant Portal" cmd /k "cd /d C:\Users\HP\CascadeProjects\office-sort\accountant-portal && python server.py"

echo Waiting 3 seconds for accountant portal to start...
timeout /t 3 /nobreak >nul

echo Starting SQL Management System (Port 3004)...
start "SQL System" cmd /k "cd /d C:\Users\HP\CascadeProjects\office-sort\sql-system && python server.py"

echo.
echo ========================================
echo OOES System Starting Up...
echo Main Dashboard: http://localhost:3002
echo Accountant Portal: http://localhost:3003
echo SQL Management: http://localhost:3004
echo Excel System: http://localhost:3002/excel-system.html (Integrated)
echo ========================================
echo.
echo All servers are starting in separate windows.
echo Press any key to exit this launcher...
pause >nul
