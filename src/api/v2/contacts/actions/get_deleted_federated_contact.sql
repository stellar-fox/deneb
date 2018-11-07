-- contacts


-- Get previously deleted federated contact ID.
SELECT id
FROM ext_contacts
WHERE pubkey = $<pubkey>
AND added_by = $<added_by>
AND status = $<status>;
