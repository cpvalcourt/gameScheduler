#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
source .env

echo -e "${GREEN}Initializing database...${NC}"

# Run the SQL script
mysql -u "$DB_USER" -p"$DB_PASSWORD" < src/config/init-db.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database initialized successfully!${NC}"
else
    echo -e "${RED}Failed to initialize database.${NC}"
    exit 1
fi 