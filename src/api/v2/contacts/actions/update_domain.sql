-- contacts


-- Update federated contact's stellar address domain.

UPDATE ext_contacts
SET domain = $<domain>, updated_at = $<date>
WHERE id = $<id>
AND added_by = $<user_id>;
