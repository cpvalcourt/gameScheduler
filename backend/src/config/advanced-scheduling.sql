-- Advanced Game Scheduling Tables

-- Recurring Patterns Table
CREATE TABLE IF NOT EXISTS RECURRING_PATTERNS (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    SERIES_ID INT NOT NULL,
    NAME VARCHAR(255) NOT NULL,
    DESCRIPTION TEXT,
    FREQUENCY ENUM('weekly', 'bi_weekly', 'monthly', 'custom') NOT NULL,
    INTERVAL INT NOT NULL DEFAULT 1, -- Every X weeks/months
    DAY_OF_WEEK INT NOT NULL, -- 0-6 (Sunday-Saturday)
    START_TIME TIME NOT NULL,
    END_TIME TIME NOT NULL,
    LOCATION VARCHAR(255) NOT NULL,
    MIN_PLAYERS INT NOT NULL DEFAULT 1,
    MAX_PLAYERS INT NOT NULL DEFAULT 20,
    START_DATE DATE NOT NULL,
    END_DATE DATE NOT NULL,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_BY INT NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SERIES_ID) REFERENCES GAME_SERIES(ID) ON DELETE CASCADE,
    FOREIGN KEY (CREATED_BY) REFERENCES USERS(ID)
);

-- Player Availability Table
CREATE TABLE IF NOT EXISTS PLAYER_AVAILABILITY (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    USER_ID INT NOT NULL,
    DATE DATE NOT NULL,
    TIME_SLOT VARCHAR(20) NOT NULL, -- "09:00-11:00", "14:00-16:00", etc.
    STATUS ENUM('available', 'unavailable', 'maybe') NOT NULL DEFAULT 'available',
    NOTES TEXT,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    UNIQUE KEY UNIQUE_AVAILABILITY (USER_ID, DATE, TIME_SLOT)
);

-- Scheduling Conflicts Table
CREATE TABLE IF NOT EXISTS SCHEDULING_CONFLICTS (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    GAME_ID INT NOT NULL,
    CONFLICT_TYPE ENUM('time_overlap', 'location_conflict', 'player_unavailable', 'weather') NOT NULL,
    CONFLICT_DETAILS TEXT NOT NULL,
    SEVERITY ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    RESOLVED BOOLEAN DEFAULT FALSE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    RESOLVED_AT TIMESTAMP NULL,
    FOREIGN KEY (GAME_ID) REFERENCES GAMES(ID) ON DELETE CASCADE
);

-- Weather Forecasts Table
CREATE TABLE IF NOT EXISTS WEATHER_FORECASTS (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    LOCATION VARCHAR(255) NOT NULL,
    DATE DATE NOT NULL,
    TEMPERATURE DECIMAL(4, 1), -- Temperature in Celsius
    CONDITION VARCHAR(50), -- 'sunny', 'rainy', 'snowy', etc.
    WIND_SPEED DECIMAL(4, 1), -- Wind speed in km/h
    PRECIPITATION_CHANCE INT, -- Percentage chance of precipitation
    IS_SUITABLE_FOR_SPORT BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY UNIQUE_WEATHER (LOCATION, DATE)
);

-- Game Notifications Table
CREATE TABLE IF NOT EXISTS GAME_NOTIFICATIONS (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    GAME_ID INT NOT NULL,
    USER_ID INT NOT NULL,
    TYPE ENUM('reminder', 'update', 'cancellation', 'conflict') NOT NULL,
    MESSAGE TEXT NOT NULL,
    SENT_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    READ_AT TIMESTAMP NULL,
    FOREIGN KEY (GAME_ID) REFERENCES GAMES(ID) ON DELETE CASCADE,
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
);

-- Game Preferences Table (for smart scheduling)
CREATE TABLE IF NOT EXISTS GAME_PREFERENCES (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    USER_ID INT NOT NULL,
    PREFERRED_DAYS JSON, -- ["0", "1", "6"] for Sunday, Monday, Saturday
    PREFERRED_TIMES JSON, -- ["09:00-11:00", "14:00-16:00"]
    PREFERRED_LOCATIONS JSON, -- ["Court A", "Park B"]
    MAX_TRAVEL_DISTANCE INT, -- in kilometers
    NOTIFICATION_PREFERENCES JSON, -- {"email": true, "sms": false, "push": true}
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    UNIQUE KEY UNIQUE_USER_PREFERENCES (USER_ID)
);

-- Game Templates Table (for quick scheduling)
CREATE TABLE IF NOT EXISTS GAME_TEMPLATES (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(255) NOT NULL,
    DESCRIPTION TEXT,
    SPORT_TYPE ENUM('Basketball', 'Baseball', 'Football', 'Soccer', 'Hockey', 'Tennis', 'Road Race', 'Ultimate Frisbee', 'Field Hockey', 'Lacrosse', 'Cricket') NOT NULL,
    DURATION INT NOT NULL, -- Duration in minutes
    MIN_PLAYERS INT NOT NULL DEFAULT 1,
    MAX_PLAYERS INT NOT NULL DEFAULT 20,
    LOCATION VARCHAR(255),
    CREATED_BY INT NOT NULL,
    IS_PUBLIC BOOLEAN DEFAULT FALSE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CREATED_BY) REFERENCES USERS(ID)
);

-- Add indexes for better performance
CREATE INDEX IDX_RECURRING_PATTERNS_SERIES ON RECURRING_PATTERNS(SERIES_ID);

CREATE INDEX IDX_RECURRING_PATTERNS_ACTIVE ON RECURRING_PATTERNS(IS_ACTIVE);

CREATE INDEX IDX_PLAYER_AVAILABILITY_USER_DATE ON PLAYER_AVAILABILITY(USER_ID, DATE);

CREATE INDEX IDX_SCHEDULING_CONFLICTS_GAME ON SCHEDULING_CONFLICTS(GAME_ID);

CREATE INDEX IDX_SCHEDULING_CONFLICTS_RESOLVED ON SCHEDULING_CONFLICTS(RESOLVED);

CREATE INDEX IDX_WEATHER_FORECASTS_LOCATION_DATE ON WEATHER_FORECASTS(LOCATION, DATE);

CREATE INDEX IDX_GAME_NOTIFICATIONS_USER ON GAME_NOTIFICATIONS(USER_ID);

CREATE INDEX IDX_GAME_NOTIFICATIONS_READ ON GAME_NOTIFICATIONS(READ_AT);