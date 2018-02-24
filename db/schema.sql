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