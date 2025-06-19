-- Use the database
USE GAME_SCHEDULER;

-- Add new columns to USERS table
ALTER TABLE USERS
    ADD COLUMN IS_VERIFIED BOOLEAN DEFAULT FALSE, ADD COLUMN VERIFICATION_TOKEN VARCHAR(
        255
    );

-- Update GAMES table structure
ALTER TABLE GAMES MODIFY COLUMN SERIES_ID INT NOT NULL,
    ADD COLUMN NAME VARCHAR(
        255
    ) NOT NULL, ADD COLUMN DESCRIPTION TEXT, ADD COLUMN DATE DATE NOT NULL, ADD COLUMN TIME TIME NOT NULL, ADD COLUMN LOCATION VARCHAR(
        255
    ) NOT NULL, ADD COLUMN MAX_PLAYERS INT NOT NULL, ADD COLUMN STATUS ENUM(
        'scheduled',
        'in_progress',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'scheduled';

-- Update foreign key constraints
ALTER TABLE GAMES DROP FOREIGN KEY IF EXISTS GAMES_IBFK_1,
    ADD CONSTRAINT GAMES_IBFK_1 FOREIGN KEY (
        SERIES_ID
    )
        REFERENCES GAME_SERIES(
            ID
        ) ON DELETE CASCADE;

-- Add new columns to GAMES table
ALTER TABLE GAMES
    ADD COLUMN IF NOT EXISTS SPORT_TYPE ENUM(
        'Basketball',
        'Baseball',
        'Football',
        'Soccer',
        'Hockey',
        'Tennis',
        'Road Race',
        'Ultimate Frisbee',
        'Field Hockey',
        'Lacrosse',
        'Cricket'
    ) NOT NULL DEFAULT 'Basketball', ADD COLUMN IF NOT EXISTS MIN_PLAYERS INT NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS CREATED_BY INT NOT NULL, ADD FOREIGN KEY (
        CREATED_BY
    )
        REFERENCES USERS(
            ID
        );