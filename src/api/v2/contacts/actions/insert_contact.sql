-- contacts


-- Add new contact
INSERT INTO contacts(
    contact_id, requested_by, status, created_at, updated_at, request_str
) VALUES(
    $<contact_id>, $<requested_by>, $<status>, $<created_at>, $<updated_at>,
    $<request_str>
);
