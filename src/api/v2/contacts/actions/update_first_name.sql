-- contacts


-- Update federated contact's first name.

UPDATE ext_contacts
SET first_name = $<first_name>, updated_at = $<date>
WHERE id = $<id>
AND added_by = $<user_id>;
