-- Copiez et exécutez ce SQL dans l'éditeur SQL de Supabase (SQL Editor → New query)

-- Table des playlists Xtream par utilisateur
create table public.playlists (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null default 'Playlist',
  host        text not null,
  port        text,
  username    text not null,
  password    text not null,
  created_at  timestamptz default now()
);

-- Activer la Row Level Security
alter table public.playlists enable row level security;

-- Chaque utilisateur ne voit que SES playlists
create policy "select own playlists"  on public.playlists for select  using (auth.uid() = user_id);
create policy "insert own playlists"  on public.playlists for insert  with check (auth.uid() = user_id);
create policy "update own playlists"  on public.playlists for update  using (auth.uid() = user_id);
create policy "delete own playlists"  on public.playlists for delete  using (auth.uid() = user_id);
