-- contacts


-- Update federated contact's stellar address alias.
UPDATE ext_contacts
SET
    alias = $<alias>,
    updated_at = $<date>
WHERE
    id = $<id> AND
    added_by = $<user_id>;
