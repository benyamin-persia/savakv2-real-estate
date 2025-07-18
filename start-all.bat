@echo off
echo Starting both servers...
start cmd /k "cd backend && npm start"
timeout /t 3
start cmd /k "cd frontend && npm start"
