-- latest currency


-- update exchange rate
UPDATE ticker
SET
    data = $<data>,
    updated_at = $<updated_at>
WHERE currency = $<currency>;
