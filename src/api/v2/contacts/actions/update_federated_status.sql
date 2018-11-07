-- contacts


-- Update federated contact's status.
UPDATE ext_contacts
SET status = $<status>
WHERE id = $<federatedId>
AND added_by = $<added_by>;
