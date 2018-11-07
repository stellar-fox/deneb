-- users


-- Get user ID by email.
SELECT id
FROM users
WHERE email = $<email>;
