INSERT INTO public.users
    (first_name, last_name, email, password_digest,
        created_at, updated_at)
    VALUES ('Igor', 'Wasinski', 'syntaxval@gmail.com',
        '$2a$10$XnzAvtLrJ6NkFxcMZORn/.5YefD.oAy67fLAfP63oDymyT196gDna',
        '2018-02-04 17:37:11.296', '2018-02-04 17:37:11.296');

-- =============================================================================

INSERT INTO public.accounts
    (pubkey, "alias", user_id, visible, currency,
        "precision", created_at, updated_at)
    VALUES ('GCUIWF5WETPRVKRT5ZYVPKYMCAHPARZGMLIYHVWZUFHGGPHRTMBFUTXA',
        'igorw', 1, true, 'eur', 2, '2018-02-04 17:37:11.296',
        '2018-02-04 17:37:11.296');