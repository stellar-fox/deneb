-- stellar address


-- update stellar address consisting of "alias" and "domain" parts

UPDATE accounts
SET alias = $<alias>, domain = $<domain>
WHERE user_id = $<user_id>;
