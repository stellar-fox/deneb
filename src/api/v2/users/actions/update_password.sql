-- user password


-- update user password
UPDATE users
SET
    password_digest = $<password_digest>,
    updated_at = $<updated_at>
WHERE uid = $<uid>;

