-- user authentication


-- get public key and path for a given user
SELECT pubkey, path
FROM accounts
WHERE user_id = $<user_id>;
