-- contacts


-- Update status code
UPDATE contacts
SET
    status = ${status}
WHERE
    contact_id = $<contact_id> AND
    requested_by = $<user_id>;
