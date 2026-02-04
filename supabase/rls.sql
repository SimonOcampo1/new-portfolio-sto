-- RLS write policies (admin-only)
-- NOTE: These policies apply only if requests include a Supabase auth JWT.
-- The service role key bypasses RLS entirely.

-- Replace with your admin email if needed.
do $$
begin
  if not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
end
$$;

-- Projects write access
drop policy if exists "admin_write_projects" on projects;
create policy "admin_write_projects"
on projects for all
to authenticated
using (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com')
with check (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com');

-- Publications write access
drop policy if exists "admin_write_publications" on publications;
create policy "admin_write_publications"
on publications for all
to authenticated
using (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com')
with check (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com');

-- Skills write access
drop policy if exists "admin_write_skills" on skills;
create policy "admin_write_skills"
on skills for all
to authenticated
using (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com')
with check (auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com');
