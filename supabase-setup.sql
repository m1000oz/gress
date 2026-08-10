-- ˚｡⋆୨୧˚  Study Nook · setup de Supabase  ˚୨୧⋆｡˚
--
-- Pega TODO este archivo en el SQL Editor de Supabase y dale Run.
-- Al final te va a devolver un UUID: ese es tu STATE_ROW_ID.

-- 1) La tabla. Una sola fila, un solo usuario, todo el estado en un jsonb.
create table if not exists public.study_state (
  id         uuid primary key,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Row Level Security ENCENDIDA y SIN políticas.
--
--    Esto no es un descuido: en Postgres, RLS activo sin políticas deniega todo
--    por defecto. Las llaves `anon` y `authenticated` (las que podrían acabar en
--    el navegador) no pueden ni leer ni escribir esta tabla.
--
--    La única llave que pasa es `service_role`, que salta RLS por diseño y vive
--    exclusivamente como variable de entorno en Vercel. Nunca llega al cliente.
alter table public.study_state enable row level security;

-- 3) Por si acaso: revocamos permisos explícitos a los roles públicos.
revoke all on public.study_state from anon, authenticated;

-- 4) Tu STATE_ROW_ID. Copia el UUID que sale acá abajo y guárdalo:
--    va como variable de entorno en Vercel.
select gen_random_uuid() as "STATE_ROW_ID — copia este valor";
