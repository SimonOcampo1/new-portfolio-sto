-- Supabase schema for portfolio app

-- Extensions
create extension if not exists "pgcrypto";

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_es text not null,
  short_desc_en text not null,
  short_desc_es text not null,
  full_desc_en text not null,
  full_desc_es text not null,
  year text not null,
  technologies text not null,
  live_url text,
  code_url text,
  tags_en text not null,
  tags_es text not null,
  media_images jsonb not null default '[]'::jsonb,
  media_videos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Publications
create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  citation_apa text not null,
  url text not null,
  lang text not null,
  tags_en text not null,
  tags_es text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skills
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Users (optional, for admin audit)
create table if not exists users (
  id uuid,
  name text,
  email text unique,
  image text,
  role text,
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on projects;
create trigger set_projects_updated_at
before update on projects
for each row execute procedure set_updated_at();

drop trigger if exists set_publications_updated_at on publications;
create trigger set_publications_updated_at
before update on publications
for each row execute procedure set_updated_at();

drop trigger if exists set_skills_updated_at on skills;
create trigger set_skills_updated_at
before update on skills
for each row execute procedure set_updated_at();

-- RLS (optional). Service role bypasses these.
alter table projects enable row level security;
alter table publications enable row level security;
alter table skills enable row level security;

-- Public read
drop policy if exists "public_read_projects" on projects;
create policy "public_read_projects"
on projects for select
using (true);

drop policy if exists "public_read_publications" on publications;
create policy "public_read_publications"
on publications for select
using (true);

drop policy if exists "public_read_skills" on skills;
create policy "public_read_skills"
on skills for select
using (true);

-- Storage bucket note:
-- Create bucket named "portfolio-media" and set it to public in Supabase Storage UI.
