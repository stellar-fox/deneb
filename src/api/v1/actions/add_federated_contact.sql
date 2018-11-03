-- federated contacts


-- add new federated contact
INSERT INTO ext_contacts (
    pubkey, added_by, alias, domain,
    created_at, updated_at, status
) VALUES (
    $<pubkey>, $<added_by>, $<alias>, $<domain>,
    $<created_at>, $<updated_at>, $<status>
)
RETURNING id;
