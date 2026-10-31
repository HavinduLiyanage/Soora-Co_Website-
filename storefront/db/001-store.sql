-- Auth tables are migrated by Better Auth before this file. No browser database access.
create table if not exists store_owners (
  user_id text primary key references auth_user(id) on delete cascade,
  enabled boolean not null default true
);
create table if not exists store_products (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  published_data jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  updated_by text not null references auth_user(id),
  check (jsonb_typeof(data) = 'object'),
  check ((status = 'published') = (published_data is not null))
);
create unique index if not exists store_product_slug on store_products ((data->>'slug'));
create unique index if not exists store_product_reference on store_products ((data->>'id'));
create table if not exists store_banners (like store_products including defaults including constraints including indexes);
-- LIKE does not copy FK constraints; keep actor attribution explicit.
create table if not exists store_settings (
  id integer primary key check (id = 1), data jsonb not null,
  version integer not null default 1, updated_at timestamptz not null default now(),
  updated_by text references auth_user(id)
);
insert into store_settings(id,data) values (1,'{"whatsapp":"","announcement":"Good watches. Great moments.","announcementLabel":"Explore the deals","announcementLink":"/deals/","previewMode":true}') on conflict do nothing;
create table if not exists store_media (
  id uuid primary key default gen_random_uuid(), url text not null unique,
  name text not null, bytes integer not null, created_at timestamptz not null default now(), created_by text not null references auth_user(id)
);
create table if not exists store_audit (
  id bigint generated always as identity primary key, table_name text not null, record_id text not null,
  actor text, before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
create or replace function record_store_change() returns trigger language plpgsql as $$
begin
  insert into store_audit(table_name,record_id,actor,before_data,after_data)
  values(TG_TABLE_NAME,new.id::text,new.updated_by,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end $$;
drop trigger if exists audit_product on store_products;
create trigger audit_product after insert or update on store_products for each row execute function record_store_change();
drop trigger if exists audit_banner on store_banners;
create trigger audit_banner after insert or update on store_banners for each row execute function record_store_change();
drop trigger if exists audit_settings on store_settings;
create trigger audit_settings after update on store_settings for each row execute function record_store_change();
-- Defence in depth: no public role may query credentials or inventory directly.
revoke all on store_products, store_banners, store_settings, store_media, store_audit, store_owners from public;
