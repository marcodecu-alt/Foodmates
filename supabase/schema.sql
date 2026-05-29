-- ============================================================
-- Foodmates Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- 3.1 profiles (extends auth.users)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  is_public   boolean default false,
  created_at  timestamptz default now()
);

-- 3.2 groups
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_by  uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now()
);

create table public.group_members (
  group_id    uuid references public.groups(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  role        text default 'member',  -- 'owner' | 'member'
  joined_at   timestamptz default now(),
  primary key (group_id, user_id)
);

-- 3.3 restaurants
create table public.restaurants (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid references public.groups(id) on delete cascade,
  added_by        uuid references public.profiles(id),
  place_id        text not null,
  name            text not null,
  address         text,
  lat             numeric,
  lng             numeric,
  cuisine         text,
  price_level     int,
  google_rating   numeric,
  photo_reference text,
  website         text,
  phone           text,
  notes           text,
  status          text default 'wishlist',
  visited_at      timestamptz,
  created_at      timestamptz default now()
);

create table public.restaurant_media (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid references public.restaurants(id) on delete cascade,
  uploaded_by    uuid references public.profiles(id),
  storage_path   text not null,
  type           text default 'photo',
  created_at     timestamptz default now()
);

-- 3.4 recipes
create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid references public.groups(id) on delete cascade,
  added_by     uuid references public.profiles(id),
  title        text not null,
  description  text,
  source_url   text,
  ingredients  jsonb,
  steps        jsonb,
  prep_time    int,
  cook_time    int,
  servings     int,
  cuisine      text,
  tags         text[],
  notes        text,
  status       text default 'wishlist',
  cooked_at    timestamptz,
  created_at   timestamptz default now()
);

create table public.recipe_media (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid references public.recipes(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  storage_path text not null,
  type        text default 'photo',
  created_at  timestamptz default now()
);

-- ============================================================
-- 3.5 Row Level Security
-- ============================================================

-- profiles
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- groups
alter table public.groups enable row level security;
create policy "groups_select" on public.groups for select
  using (id in (select group_id from group_members where user_id = auth.uid()));
create policy "groups_insert" on public.groups for insert with check (auth.uid() = created_by);
create policy "groups_update" on public.groups for update
  using (id in (select group_id from group_members where user_id = auth.uid() and role = 'owner'));
create policy "groups_delete" on public.groups for delete
  using (created_by = auth.uid());

-- group_members
alter table public.group_members enable row level security;
create policy "group_members_select" on public.group_members for select
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "group_members_insert" on public.group_members for insert
  with check (auth.uid() = user_id);
create policy "group_members_delete" on public.group_members for delete
  using (user_id = auth.uid());

-- restaurants
alter table public.restaurants enable row level security;
create policy "restaurants_select" on public.restaurants for select
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "restaurants_insert" on public.restaurants for insert
  with check (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "restaurants_update" on public.restaurants for update
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "restaurants_delete" on public.restaurants for delete
  using (group_id in (select group_id from group_members where user_id = auth.uid()));

-- restaurant_media
alter table public.restaurant_media enable row level security;
create policy "restaurant_media_select" on public.restaurant_media for select
  using (restaurant_id in (
    select id from restaurants where group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  ));
create policy "restaurant_media_insert" on public.restaurant_media for insert
  with check (uploaded_by = auth.uid());
create policy "restaurant_media_delete" on public.restaurant_media for delete
  using (uploaded_by = auth.uid());

-- recipes
alter table public.recipes enable row level security;
create policy "recipes_select" on public.recipes for select
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "recipes_insert" on public.recipes for insert
  with check (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "recipes_update" on public.recipes for update
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "recipes_delete" on public.recipes for delete
  using (group_id in (select group_id from group_members where user_id = auth.uid()));

-- recipe_media
alter table public.recipe_media enable row level security;
create policy "recipe_media_select" on public.recipe_media for select
  using (recipe_id in (
    select id from recipes where group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  ));
create policy "recipe_media_insert" on public.recipe_media for insert
  with check (uploaded_by = auth.uid());
create policy "recipe_media_delete" on public.recipe_media for delete
  using (uploaded_by = auth.uid());

-- ============================================================
-- Storage buckets (run after creating tables)
-- ============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "media_select" on storage.objects for select using (bucket_id = 'media');
create policy "media_insert" on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_delete" on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
