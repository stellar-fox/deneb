-- contacts


-- Update federated contact's preferred currency.

UPDATE ext_contacts
SET currency = $<currency>, updated_at = $<date>
WHERE id = $<id>
AND added_by = $<user_id>;
