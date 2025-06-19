#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# Function to make API calls and display results
make_request() {
    echo "Request: $1"
    echo "Response:"
    response=$(eval "$1")
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo "$response" | jq '.'
    else
        echo -e "${RED}Error: Invalid JSON response${NC}"
        echo "Raw response:"
        echo "$response"
    fi
    echo -e "\n"
}

# Get auth token
echo -e "\n=== Getting Auth Token ===\n"
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "cpvalcourt@gmail.com", "password": "newpassword123"}' | jq -r '.token')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get token${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully obtained token${NC}\n"

# Create a new team
echo -e "=== Creating a New Team ===\n"
TEAM_RESPONSE=$(curl -s -X POST http://localhost:3002/api/teams \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name": "Test Team", "description": "A team for testing"}')

echo "Request: curl -s -X POST http://localhost:3002/api/teams     -H \"Content-Type: application/json\"     -H \"Authorization: Bearer $TOKEN\"     -d '{\"name\": \"Test Team\", \"description\": \"A team for testing\"}'"
echo "Response:"
echo "$TEAM_RESPONSE" | jq '.'

# Extract team ID from response
TEAM_ID=$(echo "$TEAM_RESPONSE" | jq -r '.team.id')

if [ -z "$TEAM_ID" ]; then
    echo -e "${RED}Failed to create team${NC}"
    exit 1
fi

# Get user's teams
echo -e "\n=== Getting User's Teams ===\n"
echo "Request: curl -s -X GET http://localhost:3002/api/teams     -H \"Authorization: Bearer $TOKEN\""
echo "Response:"
curl -s -X GET http://localhost:3002/api/teams \
    -H "Authorization: Bearer $TOKEN" | jq '.'

# Get specific team
echo -e "\n=== Getting Specific Team ===\n"
echo "Request: curl -s -X GET http://localhost:3002/api/teams/$TEAM_ID     -H \"Authorization: Bearer $TOKEN\""
echo "Response:"
curl -s -X GET http://localhost:3002/api/teams/$TEAM_ID \
    -H "Authorization: Bearer $TOKEN" | jq '.'

# Update team
echo -e "\n=== Updating Team ===\n"
echo "Request: curl -s -X PUT http://localhost:3002/api/teams/$TEAM_ID     -H \"Content-Type: application/json\"     -H \"Authorization: Bearer $TOKEN\"     -d '{\"name\": \"Updated Team Name\", \"description\": \"Updated description\"}'"
echo "Response:"
curl -s -X PUT http://localhost:3002/api/teams/$TEAM_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name": "Updated Team Name", "description": "Updated description"}' | jq '.'

# Add team member
echo -e "\n=== Adding Team Member ===\n"
echo "Request: curl -s -X POST http://localhost:3002/api/teams/$TEAM_ID/members     -H \"Content-Type: application/json\"     -H \"Authorization: Bearer $TOKEN\"     -d '{\"email\": \"another@example.com\", \"role\": \"player\"}'"
echo "Response:"
curl -s -X POST http://localhost:3002/api/teams/$TEAM_ID/members \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"email": "another@example.com", "role": "player"}' | jq '.'

# Update member role
echo -e "\n=== Updating Member Role ===\n"
echo "Request: curl -s -X PUT http://localhost:3002/api/teams/$TEAM_ID/members/2/role     -H \"Content-Type: application/json\"     -H \"Authorization: Bearer $TOKEN\"     -d '{\"role\": \"captain\"}'"
echo "Response:"
curl -s -X PUT http://localhost:3002/api/teams/$TEAM_ID/members/2/role \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"role": "captain"}' | jq '.'

# Remove team member
echo -e "\n=== Removing Team Member ===\n"
echo "Request: curl -s -X DELETE http://localhost:3002/api/teams/$TEAM_ID/members/2     -H \"Authorization: Bearer $TOKEN\""
echo "Response:"
curl -s -X DELETE http://localhost:3002/api/teams/$TEAM_ID/members/2 \
    -H "Authorization: Bearer $TOKEN" | jq '.'

# Delete team
echo -e "\n=== Deleting Team ===\n"
echo "Request: curl -s -X DELETE http://localhost:3002/api/teams/$TEAM_ID     -H \"Authorization: Bearer $TOKEN\""
echo "Response:"
curl -s -X DELETE http://localhost:3002/api/teams/$TEAM_ID \
    -H "Authorization: Bearer $TOKEN" | jq '.' 