-- ledger authentication


-- get user by public key and account (path) index

SELECT user_id
FROM accounts
WHERE pubkey = $<pubkey>
AND path = $<path>;
