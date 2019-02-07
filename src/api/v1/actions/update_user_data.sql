-- user data


-- update user data (firstName and/or lastName)
UPDATE users
SET
    first_name = $<first_name>,
    last_name = $<last_name>
WHERE id = $<id>;
