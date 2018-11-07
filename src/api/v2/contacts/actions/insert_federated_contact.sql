-- contacts


-- Add federated contact.
INSERT INTO ext_contacts (
    pubkey, added_by, created_at, updated_at, status
) VALUES (
    $<pubkey>, $<added_by>, $<created_at>, $<updated_at>, $<status>
);
