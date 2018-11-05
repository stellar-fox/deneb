-- account


-- delete account entry for this user
DELETE FROM accounts
WHERE user_id = $<user_id>;
