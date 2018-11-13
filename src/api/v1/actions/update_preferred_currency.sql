-- preferred currency


-- update preferred currency
UPDATE accounts
SET currency = $<currency>
WHERE user_id = $<user_id>;
