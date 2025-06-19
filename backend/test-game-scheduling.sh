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

echo "Testing Game Scheduling Endpoints..."
echo "-----------------------------------"

# Function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4

    if [ -z "$data" ]; then
        if [ -z "$token" ]; then
            response=$(curl -s -X "$method" "$API_URL$endpoint")
        else
            response=$(curl -s -X "$method" -H "Authorization: Bearer $token" "$API_URL$endpoint")
        fi
    else
        if [ -z "$token" ]; then
            response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
        else
            response=$(curl -s -X "$method" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data" "$API_URL$endpoint")
        fi
    fi
    echo "$response"
}

# Login to get token
echo -e "\n${GREEN}Testing Login...${NC}"
login_data="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
login_response=$(make_request "POST" "/auth/login" "$login_data")
echo "Login response: $login_response"
token=$(echo $login_response | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

if [ -z "$token" ]; then
    echo -e "${RED}Login failed. Please check your credentials.${NC}"
    exit 1
fi

echo "Login successful. Token received."

# Test Game Series Endpoints
echo -e "\n${GREEN}Testing Game Series Endpoints...${NC}"

# Create a game series
echo -e "\nCreating a game series..."
series_data="{\"name\":\"Summer Basketball League\",\"description\":\"Weekly basketball games during summer\",\"type\":\"league\",\"start_date\":\"2024-06-01\",\"end_date\":\"2024-08-31\"}"
series_response=$(make_request "POST" "/game-series" "$series_data" "$token")
echo "Response: $series_response"

# Extract series ID
series_id=$(echo $series_response | python3 -c "import sys, json; print(json.load(sys.stdin)['series']['id'])")
if [ -z "$series_id" ]; then
    echo -e "${RED}Failed to create game series.${NC}"
    exit 1
fi

# Get all user's game series
echo -e "\nGetting all game series..."
series_list=$(make_request "GET" "/game-series" "" "$token")
echo "Response: $series_list"

# Get specific game series
echo -e "\nGetting specific game series..."
series_details=$(make_request "GET" "/game-series/$series_id" "" "$token")
echo "Response: $series_details"

# Update game series
echo -e "\nUpdating game series..."
update_data="{\"name\":\"Summer Basketball League 2024\",\"description\":\"Updated description for summer basketball games\"}"
update_response=$(make_request "PUT" "/game-series/$series_id" "$update_data" "$token")
echo "Response: $update_response"

# Test Game Endpoints
echo -e "\n${GREEN}Testing Game Endpoints...${NC}"

# Create a game
echo -e "\nCreating a game..."
game_data="{\"series_id\":$series_id,\"date\":\"2024-06-15\",\"time\":\"14:00\",\"location\":\"Central Park Basketball Court\",\"sport_type\":\"basketball\",\"min_players\":4,\"max_players\":10,\"jersey_type\":\"reversible\",\"jersey_color\":\"black/white\"}"
game_response=$(make_request "POST" "/games" "$game_data" "$token")
echo "Response: $game_response"

# Extract game ID
game_id=$(echo $game_response | python3 -c "import sys, json; print(json.load(sys.stdin)['game']['id'])")
if [ -z "$game_id" ]; then
    echo -e "${RED}Failed to create game.${NC}"
    exit 1
fi

# Get all user's games
echo -e "\nGetting all games..."
games_list=$(make_request "GET" "/games" "" "$token")
echo "Response: $games_list"

# Get specific game
echo -e "\nGetting specific game..."
game_details=$(make_request "GET" "/games/$game_id" "" "$token")
echo "Response: $game_details"

# Update game
echo -e "\nUpdating game..."
update_game_data="{\"time\":\"15:00\",\"location\":\"Downtown Sports Center\"}"
update_game_response=$(make_request "PUT" "/games/$game_id" "$update_game_data" "$token")
echo "Response: $update_game_response"

# Update attendance
echo -e "\nUpdating game attendance..."
attendance_data="{\"status\":\"attending\",\"notes\":\"Will bring water\"}"
attendance_response=$(make_request "POST" "/games/$game_id/attendance" "$attendance_data" "$token")
echo "Response: $attendance_response"

# Clean up
echo -e "\n${GREEN}Cleaning up...${NC}"

# Delete game
echo -e "\nDeleting game..."
delete_game_response=$(make_request "DELETE" "/games/$game_id" "" "$token")
echo "Response: $delete_game_response"

# Delete game series
echo -e "\nDeleting game series..."
delete_series_response=$(make_request "DELETE" "/game-series/$series_id" "" "$token")
echo "Response: $delete_series_response"

echo -e "\n${GREEN}Test completed!${NC}" 