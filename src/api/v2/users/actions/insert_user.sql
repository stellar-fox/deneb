-- user


-- insert new user into table

INSERT INTO users(
    email, uid, password_digest, created_at, updated_at
)
VALUES(
    $<email>, $<uid>, $<password_digest>, $<created_at>, $<updated_at>
)
RETURNING id;
