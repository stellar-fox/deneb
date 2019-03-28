-- accounts timestamp


-- update accounts timestamp
UPDATE accounts
SET updated_at = $<updated_at>
WHERE user_id = $<user_id>;

