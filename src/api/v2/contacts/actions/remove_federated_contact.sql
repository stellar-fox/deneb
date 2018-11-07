-- contacts


-- Remove federated contact by setting status code to "DELETED"
UPDATE ext_contacts
SET
    status = $<deleted>
WHERE
    id = $<id> AND
    added_by = $<user_id>;
