-- contacts


-- List internal contacts with status code "APPROVED" (2)

SELECT
    COALESCE(users.first_name, '') AS first_name,
    COALESCE(users.last_name, '') AS last_name,
    COALESCE(accounts.alias, '') AS alias,
    COALESCE(accounts.domain, '') AS domain,
    accounts.pubkey,
    accounts.currency,
    accounts.precision,
    accounts.email_md5,
    accounts.memo_type,
    accounts.memo,
    contacts.contact_id,
    contacts.status,
    contacts.created_at,
    contacts.updated_at,
    users.email
FROM contacts
INNER JOIN users ON users.id = contacts.contact_id
INNER JOIN accounts ON users.id = accounts.user_id
WHERE contacts.status = $<approved>
AND contacts.requested_by = $<user_id>;
