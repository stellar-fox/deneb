-- latest currency


-- get exchange rate
SELECT *
FROM ticker
WHERE currency = $<currency>;
