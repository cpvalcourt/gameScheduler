-- Add profile_picture_url column to users table
ALTER TABLE USERS
    ADD COLUMN PROFILE_PICTURE_URL VARCHAR(
        255
    ) NULL;

-- Add index for faster lookups
CREATE INDEX IDX_USERS_PROFILE_PICTURE ON USERS(PROFILE_PICTURE_URL);