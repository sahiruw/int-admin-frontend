-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.box_size (
  breeder_id integer NOT NULL,
  size text NOT NULL,
  length_cm numeric,
  width_cm numeric,
  thickness_cm numeric,
  CONSTRAINT box_size_pkey PRIMARY KEY (breeder_id, size),
  CONSTRAINT box_size_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES public.breeder(id)
);
CREATE TABLE public.breeder (
  id integer NOT NULL DEFAULT nextval('breeder_id_seq'::regclass),
  name text,
  CONSTRAINT breeder_pkey PRIMARY KEY (id)
);
CREATE TABLE public.configuration (
  id integer NOT NULL DEFAULT nextval('configuration_id_seq'::regclass),
  ex_rate numeric NOT NULL,
  shipping_cost numeric NOT NULL,
  commission numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT configuration_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer (
  id integer NOT NULL DEFAULT nextval('customer_id_seq'::regclass),
  name text,
  CONSTRAINT customer_pkey PRIMARY KEY (id)
);
CREATE TABLE public.koiinfo (
  picture_id text NOT NULL,
  koi_id integer,
  sex text,
  age integer,
  size_cm text,
  breeder_id integer,
  pcs integer,
  jpy_cost numeric,
  customer_id integer,
  ship_to integer,
  sale_price_jpy numeric,
  sale_price_usd numeric,
  comm numeric,
  rate numeric,
  timestamp timestamp with time zone,
  CONSTRAINT koiinfo_pkey PRIMARY KEY (picture_id),
  CONSTRAINT koiinfo_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES public.breeder(id),
  CONSTRAINT koiinfo_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(id),
  CONSTRAINT koiinfo_koi_id_fkey FOREIGN KEY (koi_id) REFERENCES public.variety(id),
  CONSTRAINT koiinfo_ship_to_fkey FOREIGN KEY (ship_to) REFERENCES public.shippinglocation(id)
);
CREATE TABLE public.shipinfo (
  picture_id text NOT NULL,
  date date,
  box_count numeric,
  box_size text,
  weight_of_box numeric,
  shipped boolean,
  grouping text,
  shipping_cost_per_kg numeric,
  timestamp timestamp with time zone,
  CONSTRAINT shipinfo_pkey PRIMARY KEY (picture_id),
  CONSTRAINT shipinfo_picture_id_fkey FOREIGN KEY (picture_id) REFERENCES public.koiinfo(picture_id)
);
CREATE TABLE public.shippinglocation (
  id integer NOT NULL DEFAULT nextval('shippinglocation_id_seq'::regclass),
  name text,
  CONSTRAINT shippinglocation_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'assistant'::text CHECK (role = ANY (ARRAY['admin'::text, 'assistant'::text])),
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.variety (
  id integer NOT NULL DEFAULT nextval('variety_id_seq'::regclass),
  variety text,
  woo_variety text,
  CONSTRAINT variety_pkey PRIMARY KEY (id)
);