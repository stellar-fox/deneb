-- contacts


-- delete federated contacts relations for this user

DELETE FROM ext_contacts
WHERE added_by = $<user_id>;
