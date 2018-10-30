-- user authentication


-- get list of users with a specified e-mail address
SELECT * FROM users WHERE email = $<email>;
