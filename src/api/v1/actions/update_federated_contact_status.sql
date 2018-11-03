-- federated contacts


-- update federated contact's status to VISIBLE

UPDATE ext_contacts
    SET status = 2
WHERE
    id = $<id> AND
    added_by = $<added_by>;
