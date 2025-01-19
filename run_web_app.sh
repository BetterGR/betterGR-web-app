export CLIENT_SECRET=**********
export NEXT_PUBLIC_KEYCLOAK_URL=http://auth.BetterGR.org
export NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
export  NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:1234/api
rm -rf .next
npm run dev