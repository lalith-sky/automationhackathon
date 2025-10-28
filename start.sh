#!/bin/bash

echo "Starting J.A.R.V.I.S AI Dashboard..."
echo

echo "Starting Backend Server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

echo
echo "Waiting for backend to start..."
sleep 5

echo
echo "Starting Frontend Server..."
cd ../frontend
npx http-server . -p 3000 -o &
FRONTEND_PID=$!

echo
echo "J.A.R.V.I.S AI Dashboard is starting up!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
