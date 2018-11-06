-- contacts


-- Update federated contact's last name.

UPDATE ext_contacts
SET last_name = $<last_name>, updated_at = $<date>
WHERE id = $<id>
AND added_by = $<user_id>;
