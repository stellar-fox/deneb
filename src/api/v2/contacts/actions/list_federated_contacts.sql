-- contacts


-- List federated contacts with status code "APPROVED"
SELECT
    id, pubkey, alias, domain, currency, memo_type, memo, email_md5,
    first_name, last_name
FROM ext_contacts
WHERE
    status = $<approved> AND
    ext_contacts.added_by = $<user_id>;
