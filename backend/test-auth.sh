#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Authentication Endpoints${NC}"
echo -e "${GREEN}===============================${NC}\n"

echo -e "${GREEN}Testing Registration${NC}"
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "cpvalcourt@gmail.com", "password": "testpassword123"}'

echo -e "\n\n${GREEN}Testing Password Reset Request${NC}"
RESET_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "cpvalcourt@gmail.com"}')
echo $RESET_RESPONSE

# Wait for a moment to ensure the reset token is generated
sleep 2

echo -e "\n\n${GREEN}Testing Password Reset${NC}"
curl -X POST http://localhost:3002/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "35ce7d33cceb7f82ad14b2282cbaa2e5c9a6f22b3e511588ba71fab3da13f3c8", "password": "newpassword123"}'

echo -e "\n\n${GREEN}Testing Login with New Password${NC}"
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cpvalcourt@gmail.com", "password": "newpassword123"}'

echo -e "\n\n${GREEN}Testing Login${NC}"
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cpvalcourt@gmail.com", "password": "testpassword123"}'

echo -e "\n\n${GREEN}Testing Password Reset Request${NC}"
curl -X POST http://localhost:3002/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "cpvalcourt@gmail.com"}'

echo -e "\n\nNote: To test password reset, you need to:"
echo "1. Check the email for the reset token"
echo "2. Use that token in the reset password request"
echo "3. Run the following command with the token:"
echo "curl -X POST http://localhost:3002/api/auth/reset-password \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"token\": \"YOUR_TOKEN\", \"password\": \"newpassword123\"}'" 