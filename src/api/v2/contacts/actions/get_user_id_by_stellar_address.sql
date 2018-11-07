-- accounts


-- Get user ID by stellar address.

SELECT user_id
FROM accounts
WHERE alias = $<alias>
AND domain = $<domain>;
