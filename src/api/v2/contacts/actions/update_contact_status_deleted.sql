-- contacts


-- Update status code to "DELETED"

UPDATE contacts
SET status = ${deleted}
WHERE contact_id = $<contact_id>
AND requested_by = $<user_id>;
