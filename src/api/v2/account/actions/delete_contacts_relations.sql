-- contacts


-- delete contacts relations for this user
DELETE FROM contacts
WHERE
    contact_id = $<user_id> OR
    requested_by = $<user_id>;
