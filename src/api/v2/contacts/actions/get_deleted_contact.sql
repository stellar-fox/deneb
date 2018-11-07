-- contacts


-- Get previously deleted contact ID.

SELECT contact_id, requested_by, status
FROM contacts
WHERE contact_id = $<contactId>
AND requested_by = $<requestedBy>
AND status = $<status>;
