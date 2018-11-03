-- memo type


-- update memo type
UPDATE accounts
    SET
        memo_type = $<memo_type>,
        memo = $<memo>
WHERE user_id = $<user_id>;
