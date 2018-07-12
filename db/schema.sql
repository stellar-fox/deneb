-- =============================================================================
CREATE SEQUENCE public.ticker_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.ticker_id_seq
  OWNER TO aquila;

CREATE TABLE public.ticker
(
  id integer NOT NULL DEFAULT nextval('ticker_id_seq'::regclass),
  currency character varying,
  data json,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT ticker_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.ticker
  OWNER TO aquila;

-- =============================================================================
CREATE SEQUENCE public.users_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.users_id_seq
  OWNER TO aquila;


CREATE TABLE public.users
(
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  first_name character varying,
  last_name character varying,
  email character varying,
  password_digest character varying,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  UNIQUE(email),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.users
  OWNER TO aquila;


-- =============================================================================
CREATE SEQUENCE public.accounts_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.accounts_id_seq
  OWNER TO aquila;


CREATE TABLE public.accounts
(
  id bigint NOT NULL DEFAULT nextval('accounts_id_seq'::regclass),
  pubkey character varying NOT NULL,
  alias character varying,
  user_id integer NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  UNIQUE(pubkey, user_id),
  CONSTRAINT accounts_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.accounts
  OWNER TO aquila;

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN currency character varying NOT NULL DEFAULT 'eur';

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN precision integer NOT NULL DEFAULT 2;

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN path integer NOT NULL DEFAULT 0;

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN email_md5 character varying;

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN domain character varying;

-- =============================================================================
ALTER TABLE public.accounts
  ADD CONSTRAINT alias_domain UNIQUE (alias, domain);

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN memo_type character varying;

-- =============================================================================
ALTER TABLE public.accounts
  ADD COLUMN memo character varying;

-- =============================================================================
ALTER TABLE public.accounts ALTER COLUMN memo_type SET DEFAULT '';
ALTER TABLE public.accounts ALTER COLUMN memo_type SET NOT NULL;
ALTER TABLE public.accounts ALTER COLUMN memo SET DEFAULT '';
ALTER TABLE public.accounts ALTER COLUMN memo SET NOT NULL;

-- =============================================================================
CREATE SEQUENCE public.contacts_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.contacts_id_seq
  OWNER TO aquila;


CREATE TABLE public.contacts
(
  id bigint NOT NULL DEFAULT nextval('contacts_id_seq'::regclass),
  contact_id integer NOT NULL,
  requested_by integer NOT NULL,
  status integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  UNIQUE(contact_id, requested_by),
  CONSTRAINT contact_id_and_requested_by_must_not_be_the_same
  CHECK(contact_id <> requested_by),
  CONSTRAINT contacts_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.contacts
  OWNER TO aquila;

-- =============================================================================
CREATE SEQUENCE public.ext_contacts_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.ext_contacts_id_seq
  OWNER TO aquila;


CREATE TABLE public.ext_contacts
(
  id bigint NOT NULL DEFAULT nextval('ext_contacts_id_seq'::regclass),
  status integer NOT NULL DEFAULT 0,
  pubkey character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  email character varying,
  email_md5 character varying,
  alias character varying NOT NULL DEFAULT ''::character varying,
  domain character varying NOT NULL DEFAULT ''::character varying,
  memo_type character varying NOT NULL DEFAULT ''::character varying,
  memo character varying NOT NULL DEFAULT ''::character varying,
  currency character varying NOT NULL DEFAULT 'eur'::character varying,
  added_by integer NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  UNIQUE(added_by, pubkey),
  CONSTRAINT ext_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT memo_col_len CHECK (length(memo) < 29)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.ext_contacts
  OWNER TO aquila;

-- =============================================================================
ALTER TABLE public.users
  ADD COLUMN uid character varying;

-- =============================================================================
ALTER TABLE public.contacts
  ADD COLUMN request_str character varying;
