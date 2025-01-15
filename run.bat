@echo off

:: Set environment variable
set NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:1234

:: Remove the .next directory
if exist .next (
    rmdir /s /q .next
)

:: Run the development server
npm run dev
