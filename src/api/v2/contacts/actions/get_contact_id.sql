-- contacts


-- Get contact ID by status and requested_by.
SELECT
    contact_id
FROM contacts
WHERE
    contact_id = $<contact_id> AND
    requested_by = $<requested_by> AND
    status = $<status>;
