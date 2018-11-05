-- contacts


-- List internal contacts with status code "REQUESTED"
SELECT
    contacts.contact_id,
    contacts.requested_by,
    contacts.created_at,
    contacts.status,
    accounts.alias,
    accounts.domain,
    accounts.pubkey,
    accounts.email_md5,
    users.first_name,
    users.last_name
FROM contacts
    INNER JOIN accounts ON contacts.requested_by = accounts.user_id
    INNER JOIN users ON contacts.requested_by = users.id
WHERE
    contacts.contact_id = $<user_id> AND
    contacts.status IN ($<requested>);
