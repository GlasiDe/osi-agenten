-- Eigene Tabellen der Online-Fassung. Die Tabellen von Better Auth ("user", session, account, verification,
-- "rateLimit") legt scripts/migrate.mjs vorher aus lib/auth-optionen.mjs an.
-- Personenbezogen ist nur der Benutzername. Löschen eines Kontos entfernt alles (on delete cascade).

create table if not exists klasse (
  id uuid primary key default gen_random_uuid(),
  lehrkraft_id text not null references "user"(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  code text not null unique,
  aktiv boolean not null default true,
  erstellt timestamptz not null default now()
);
create index if not exists klasse_lehrkraft_idx on klasse (lehrkraft_id);

-- Lernende gehören zu genau einer Klasse
create table if not exists mitgliedschaft (
  user_id text primary key references "user"(id) on delete cascade,
  klasse_id uuid not null references klasse(id) on delete cascade,
  beigetreten timestamptz not null default now()
);
create index if not exists mitgliedschaft_klasse_idx on mitgliedschaft (klasse_id);

-- Ein Spielstand je Konto (das JSON des Spiels) plus Kennzahlen für Rangliste und Zentrale
create table if not exists spielstand (
  user_id text primary key references "user"(id) on delete cascade,
  daten jsonb not null,
  version text,
  codename text,
  avatar text,
  punkte integer not null default 0,
  front text,
  fall real not null default 0,
  aktualisiert timestamptz not null default now()
);
