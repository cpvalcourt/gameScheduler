#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Email Verification${NC}"
echo -e "${GREEN}========================${NC}\n"

# Test registration with new email
echo -e "${GREEN}Testing Registration with New Email${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuserverify", "email": "test.verification@example.com", "password": "testpassword123"}')

# Pretty print the JSON response
echo $REGISTER_RESPONSE | python3 -m json.tool

# Extract verification token from the response
VERIFICATION_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"verification_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$VERIFICATION_TOKEN" ]; then
    echo -e "${RED}No verification token found in response${NC}"
    echo -e "${RED}Full response: $REGISTER_RESPONSE${NC}"
    exit 1
fi

echo -e "\n${GREEN}Verification token: $VERIFICATION_TOKEN${NC}"

# Test email verification
echo -e "\n${GREEN}Testing Email Verification${NC}"
VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3002/api/auth/verify-email/$VERIFICATION_TOKEN)
echo $VERIFY_RESPONSE | python3 -m json.tool

# Test login before verification
echo -e "\n\n${GREEN}Testing Login Before Verification${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test.verification@example.com", "password": "testpassword123"}')
echo $LOGIN_RESPONSE | python3 -m json.tool

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}No token found in login response${NC}"
    echo -e "${RED}Full response: $LOGIN_RESPONSE${NC}"
    exit 1
fi

# Test accessing team features before verification
echo -e "\n\n${GREEN}Testing Team Access Before Verification${NC}"
TEAM_RESPONSE=$(curl -s -X GET http://localhost:3002/api/teams \
  -H "Authorization: Bearer $TOKEN")
echo $TEAM_RESPONSE | python3 -m json.tool

# Test resending verification email
echo -e "\n\n${GREEN}Testing Resend Verification Email${NC}"
RESEND_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test.verification@example.com"}')
echo $RESEND_RESPONSE | python3 -m json.tool

# Wait for a moment to ensure the new token is generated
sleep 2

# Test email verification again
echo -e "\n\n${GREEN}Testing Email Verification Again${NC}"
VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3002/api/auth/verify-email/$VERIFICATION_TOKEN)
echo $VERIFY_RESPONSE | python3 -m json.tool

# Test login after verification
echo -e "\n\n${GREEN}Testing Login After Verification${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test.verification@example.com", "password": "testpassword123"}')
echo $LOGIN_RESPONSE | python3 -m json.tool

# Extract new token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}No token found in login response${NC}"
    echo -e "${RED}Full response: $LOGIN_RESPONSE${NC}"
    exit 1
fi

# Test accessing team features after verification
echo -e "\n\n${GREEN}Testing Team Access After Verification${NC}"
TEAM_RESPONSE=$(curl -s -X GET http://localhost:3002/api/teams \
  -H "Authorization: Bearer $TOKEN")
echo $TEAM_RESPONSE | python3 -m json.tool 