-- stellar address visibility


-- Update stellar address visibility. When set to false then the address will
-- not be returned by Federation Service

UPDATE accounts
SET visible = $<visible>
WHERE user_id = $<user_id>;
