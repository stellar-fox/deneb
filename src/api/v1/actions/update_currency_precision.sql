-- preferred currency precision


-- update preferred currency precision


UPDATE accounts
SET precision = $<precision>
WHERE user_id = $<user_id>;
