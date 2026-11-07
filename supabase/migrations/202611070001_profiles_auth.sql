-- ProofFlow account profiles. Public users can only complete client/freelancer roles.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  email text not null default '' check (char_length(email) <= 254),
  role text not null default 'client' check (role in ('client', 'freelancer', 'admin')),
  role_confirmed boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own public profile fields" on public.profiles;
create policy "Users can update their own public profile fields"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profile_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := lower(coalesce(new.raw_user_meta_data ->> 'role', ''));
  is_public_role boolean;
begin
  is_public_role := requested_role in ('client', 'freelancer');
  insert into public.profiles (id, full_name, email, role, role_confirmed, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1)), 100),
    coalesce(new.email, ''),
    case when is_public_role then requested_role else 'client' end,
    is_public_role,
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_proofflow on auth.users;
create trigger on_auth_user_created_proofflow
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- OAuth users without a role can select a public role exactly once after authentication.
create or replace function public.finalize_initial_profile(requested_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if lower(coalesce(requested_role, '')) not in ('client', 'freelancer') then
    raise exception 'Invalid public role';
  end if;
  update public.profiles
     set role = lower(requested_role), role_confirmed = true, updated_at = now()
   where id = current_user_id and role_confirmed = false;
  if not found then
    raise exception 'Profile role has already been finalized';
  end if;
end;
$$;

revoke all on function public.finalize_initial_profile(text) from public, anon;
grant execute on function public.finalize_initial_profile(text) to authenticated;

-- Admin promotion is an operator action only. Run this from the Supabase SQL editor
-- after verifying the target user's auth.users id; never expose this through the app.
