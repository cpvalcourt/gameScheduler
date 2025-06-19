-- Password Reset SQL Script
-- Usage: Replace 'user@example.com' with the actual email and 'newpassword123' with the desired password

-- First, check if the user exists
SELECT
    ID,
    EMAIL,
    NAME
FROM
    USERS
WHERE
    EMAIL = 'user@example.com';

-- Then update the password (you'll need to hash this password first)
-- The password below is the hash for 'password123'
UPDATE USERS
SET
    PASSWORD = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    UPDATED_AT = NOW(
    )
WHERE
    EMAIL = 'user@example.com';

-- Verify the update
SELECT
    ID,
    EMAIL,
    NAME,
    UPDATED_AT
FROM
    USERS
WHERE
    EMAIL = 'user@example.com';