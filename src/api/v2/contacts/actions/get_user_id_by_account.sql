-- accounts


-- Get user ID by account ID.
SELECT user_id
FROM accounts
WHERE pubkey = $<pubkey>;
