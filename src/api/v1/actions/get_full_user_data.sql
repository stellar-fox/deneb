-- user


-- get full user data from user and account tables

SELECT
    users.first_name, users.last_name, users.email,
    accounts.alias, accounts.domain, accounts.currency, accounts.visible,
    accounts.email_md5, accounts.memo_type, accounts.memo
FROM
    users INNER JOIN accounts
        ON users.id = accounts.user_id
WHERE users.id = $<id>;
