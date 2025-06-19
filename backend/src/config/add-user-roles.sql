-- Add user roles column to USERS table
ALTER TABLE USERS
    ADD COLUMN ROLE ENUM(
        'user',
        'moderator',
        'admin'
    ) DEFAULT 'user' AFTER IS_VERIFIED;

-- Add is_active column for user management
ALTER TABLE USERS
    ADD COLUMN IS_ACTIVE BOOLEAN DEFAULT TRUE AFTER ROLE;

-- Add admin_notes column for admin management
ALTER TABLE USERS
    ADD COLUMN ADMIN_NOTES TEXT AFTER IS_ACTIVE;

-- Create an admin user (you can change the email/username as needed)
-- Password will be 'admin123' (hashed)
UPDATE USERS
SET
    ROLE = 'admin',
    IS_VERIFIED = TRUE
WHERE
    EMAIL = 'cpvalcourt@gmail.com';

-- Add indexes for better performance
CREATE INDEX IDX_USERS_ROLE ON USERS(ROLE);

CREATE INDEX IDX_USERS_IS_ACTIVE ON USERS(IS_ACTIVE);

CREATE INDEX IDX_USERS_CREATED_AT ON USERS(CREATED_AT);