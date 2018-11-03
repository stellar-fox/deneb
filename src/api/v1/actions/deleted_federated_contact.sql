-- federated contacts


-- search for previously deleted federated contact
SELECT id FROM ext_contacts
WHERE
    pubkey = $<pubkey> AND
    alias = $<alias> AND
    domain = $<domain> AND
    added_by = $<added_by> AND
    status = $<status>;
