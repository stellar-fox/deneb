-- contacts


-- Update federated contact's memo and memo type.

UPDATE ext_contacts
SET memo_type = 'text', memo = $<memo>, updated_at = $<date>
WHERE id = $<id>
AND added_by = $<user_id>;
