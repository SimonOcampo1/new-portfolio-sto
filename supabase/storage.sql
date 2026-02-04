-- Storage setup for project media

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

-- Public read access to media files
drop policy if exists "public_read_portfolio_media" on storage.objects;
create policy "public_read_portfolio_media"
on storage.objects for select
using (bucket_id = 'portfolio-media');

-- Admin-only write access to media files
drop policy if exists "admin_write_portfolio_media" on storage.objects;
create policy "admin_write_portfolio_media"
on storage.objects for all
to authenticated
using (
  bucket_id = 'portfolio-media'
  and auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com'
)
with check (
  bucket_id = 'portfolio-media'
  and auth.jwt() ->> 'email' = 'ocamposimon1@gmail.com'
);
