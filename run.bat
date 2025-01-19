@echo off

:: Set environment variable
set NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:1234/api
set CLIENT_SECRET=**********
set NEXT_PUBLIC_KEYCLOAK_URL=http://auth.BetterGR.org
set NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback

:: Remove the .next directory
if exist .next (
    rmdir /s /q .next
)

:: Run the development server
npm run dev
