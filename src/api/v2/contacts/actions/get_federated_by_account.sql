-- contacts


-- Get federated contact ID by account ID, status and added_by.
SELECT id
FROM ext_contacts
WHERE pubkey = $<pubkey>
AND added_by = $<added_by>
AND status = $<status>;
