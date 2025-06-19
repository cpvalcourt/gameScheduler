#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API URL
API_URL="http://localhost:3002/api"

# Test user credentials
EMAIL="game.test@example.com"
PASSWORD="testpassword123"
USERNAME="gametester"

echo "Setting up test user for game scheduling tests..."
echo "------------------------------------------------"

# Function to make requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
    fi
    echo "$response"
}

# Register new user
echo -e "\n${GREEN}Registering new test user...${NC}"
register_data="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"username\":\"$USERNAME\"}"
register_response=$(make_request "POST" "/auth/register" "$register_data")
echo "Response: $register_response"

if echo "$register_response" | grep -q 'already exists'; then
    echo -e "${RED}User already exists. Attempting to log in...${NC}"
    login_data="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
    login_response=$(make_request "POST" "/auth/login" "$login_data")
    token=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -z "$token" ]; then
        echo -e "${RED}Login failed. Please check the user's status or reset the user manually.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Login successful. Test user is ready!${NC}"
    exit 0
fi

# Extract verification token
verification_token=$(echo $register_response | grep -o '"verification_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$verification_token" ]; then
    echo -e "${RED}Failed to get verification token.${NC}"
    exit 1
fi

# Verify email
echo -e "\n${GREEN}Verifying email...${NC}"
verify_response=$(make_request "POST" "/auth/verify-email" "{\"token\":\"$verification_token\"}")
echo "Response: $verify_response"

# Login to verify setup
echo -e "\n${GREEN}Logging in to verify setup...${NC}"
login_data="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
login_response=$(make_request "POST" "/auth/login" "$login_data")
token=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$token" ]; then
    echo -e "${RED}Login failed. Please check the setup process.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Test user setup completed successfully!${NC}"
echo "You can now use these credentials in the test-game-scheduling.sh script:"
echo "Email: $EMAIL"
echo "Password: $PASSWORD" 