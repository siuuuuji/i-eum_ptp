-- 이음 MVP database schema
-- Supabase SQL Editor에서 전체 실행하세요.

create extension if not exists pgcrypto;

create type public.user_role as enum ('senior', 'family');
create type public.memory_visibility as enum ('family', 'private');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  role public.user_role not null default 'family',
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6}$'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id),
  unique (user_id)
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 300),
  answer text not null default '' check (char_length(answer) <= 10000),
  audio_path text,
  visibility public.memory_visibility not null default 'family',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (answer <> '' or audio_path is not null)
);

create table public.family_posts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  font_scale numeric(3,2) not null default 1.00 check (font_scale between .90 and 1.25),
  radio_time time,
  updated_at timestamptz not null default now()
);

create index memories_family_created_idx on public.memories(family_id, created_at desc);
create index family_posts_family_created_idx on public.family_posts(family_id, created_at desc);
create index family_members_user_idx on public.family_members(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), '이음 가족'),
    case when new.raw_user_meta_data->>'role' = 'senior' then 'senior'::public.user_role else 'family'::public.user_role end
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_family_member(target_family uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid()
  );
$$;

create or replace function public.shares_family(target_user uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.family_members mine
    join public.family_members theirs on theirs.family_id = mine.family_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user
  );
$$;

create or replace function public.new_invite_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.create_family_with_owner(family_name text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  new_id uuid;
  code text;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception '이미 가족에 연결되어 있습니다.';
  end if;
  if char_length(trim(family_name)) not between 1 and 40 then
    raise exception '가족 이름은 1~40자로 입력해 주세요.';
  end if;
  loop
    code := public.new_invite_code();
    exit when not exists (select 1 from public.families where invite_code = code);
  end loop;
  insert into public.families(name, invite_code, created_by)
  values (trim(family_name), code, auth.uid())
  returning id into new_id;
  insert into public.family_members(family_id, user_id) values (new_id, auth.uid());
  return new_id;
end;
$$;

create or replace function public.join_family_by_code(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception '이미 가족에 연결되어 있습니다.';
  end if;
  select id into target_id from public.families where invite_code = upper(trim(code));
  if target_id is null then raise exception '초대코드를 확인해 주세요.'; end if;
  insert into public.family_members(family_id, user_id) values (target_id, auth.uid());
  return target_id;
end;
$$;

grant execute on function public.create_family_with_owner(text) to authenticated;
grant execute on function public.join_family_by_code(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.memories enable row level security;
alter table public.family_posts enable row level security;
alter table public.user_settings enable row level security;

create policy "profile_self_or_family_read" on public.profiles for select to authenticated
using (id = auth.uid() or public.shares_family(id));
create policy "profile_self_update" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy "family_member_read" on public.families for select to authenticated
using (public.is_family_member(id));

create policy "member_same_family_read" on public.family_members for select to authenticated
using (public.is_family_member(family_id));

create policy "memory_family_read" on public.memories for select to authenticated
using (
  public.is_family_member(family_id)
  and (visibility = 'family' or user_id = auth.uid())
);
create policy "memory_owner_insert" on public.memories for insert to authenticated
with check (user_id = auth.uid() and public.is_family_member(family_id));
create policy "memory_owner_update" on public.memories for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_family_member(family_id));
create policy "memory_owner_delete" on public.memories for delete to authenticated
using (user_id = auth.uid());

create policy "post_family_read" on public.family_posts for select to authenticated
using (public.is_family_member(family_id));
create policy "post_member_insert" on public.family_posts for insert to authenticated
with check (author_id = auth.uid() and public.is_family_member(family_id));
create policy "post_author_update" on public.family_posts for update to authenticated
using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "post_author_delete" on public.family_posts for delete to authenticated
using (author_id = auth.uid());

create policy "settings_self_all" on public.user_settings for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-recordings',
  'voice-recordings',
  false,
  10485760,
  array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "voice_family_read" on storage.objects for select to authenticated
using (
  bucket_id = 'voice-recordings'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);
create policy "voice_owner_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'voice-recordings'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2] = auth.uid()::text
);
create policy "voice_owner_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'voice-recordings'
  and (storage.foldername(name))[2] = auth.uid()::text
);

