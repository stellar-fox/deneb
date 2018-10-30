-- latest currency


-- set exchange rate
INSERT INTO ticker (currency, data, updated_at)
VALUES ($<currency>, $<data>, $<updated_at>);
