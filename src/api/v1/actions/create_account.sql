-- user authentication


-- create new account entry

INSERT INTO accounts(
    pubkey, path, alias, user_id, visible, created_at, updated_at, email_md5
)
VALUES(
    $<pubkey>, $<path>, $<alias>, $<user_id>, $<visible>, $<created_at>,
    $<updated_at>, $<email_md5>
) RETURNING id;
