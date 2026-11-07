-- Real ProofFlow project records. No escrow funding or transfers are performed here.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null check (char_length(trim(description)) between 1 and 5000),
  budget_amount numeric(20, 9) not null check (budget_amount > 0),
  budget_currency text not null default 'SOL' check (budget_currency = 'SOL'),
  deadline date not null,
  required_skills text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_skills_count_check check (cardinality(required_skills) <= 20)
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  amount numeric(20, 9) not null check (amount > 0),
  currency text not null default 'SOL' check (currency = 'SOL'),
  due_date date not null,
  sequence_number integer not null check (sequence_number > 0),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_milestones_sequence_unique unique (project_id, sequence_number)
);

create index if not exists projects_client_created_idx
  on public.projects (client_id, created_at desc);
create index if not exists projects_open_deadline_idx
  on public.projects (deadline, created_at desc) where status = 'open';
create index if not exists project_milestones_project_sequence_idx
  on public.project_milestones (project_id, sequence_number);

alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_milestones from anon, authenticated;
grant select on table public.projects to authenticated;
grant select on table public.project_milestones to authenticated;

drop policy if exists "Clients read their projects and freelancers discover open projects" on public.projects;
create policy "Clients read their projects and freelancers discover open projects"
  on public.projects for select to authenticated
  using (
    (
      client_id = (select auth.uid())
      and exists (
        select 1 from public.profiles profile
        where profile.id = (select auth.uid())
          and profile.role = 'client'
          and profile.role_confirmed
      )
    )
    or (
      status = 'open'
      and exists (
        select 1 from public.profiles profile
        where profile.id = (select auth.uid())
          and profile.role = 'freelancer'
          and profile.role_confirmed
      )
    )
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.role = 'admin'
        and profile.role_confirmed
    )
  );

drop policy if exists "Clients create projects for themselves" on public.projects;
create policy "Clients create projects for themselves"
  on public.projects for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.role = 'client'
        and profile.role_confirmed
    )
  );

drop policy if exists "Clients update their projects" on public.projects;
create policy "Clients update their projects"
  on public.projects for update to authenticated
  using (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.role = 'client'
        and profile.role_confirmed
    )
  )
  with check (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.role = 'client'
        and profile.role_confirmed
    )
  );

drop policy if exists "Clients delete their projects" on public.projects;
create policy "Clients delete their projects"
  on public.projects for delete to authenticated
  using (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.role = 'client'
        and profile.role_confirmed
    )
  );

drop policy if exists "Users read milestones for visible projects" on public.project_milestones;
create policy "Users read milestones for visible projects"
  on public.project_milestones for select to authenticated
  using (exists (
    select 1 from public.projects project
    where project.id = project_id
  ));

drop policy if exists "Clients add milestones to their projects" on public.project_milestones;
create policy "Clients add milestones to their projects"
  on public.project_milestones for insert to authenticated
  with check (exists (
    select 1 from public.projects project
    join public.profiles profile on profile.id = (select auth.uid())
    where project.id = project_id
      and project.client_id = (select auth.uid())
      and profile.role = 'client'
      and profile.role_confirmed
  ));

drop policy if exists "Clients update milestones on their projects" on public.project_milestones;
create policy "Clients update milestones on their projects"
  on public.project_milestones for update to authenticated
  using (exists (
    select 1 from public.projects project
    join public.profiles profile on profile.id = (select auth.uid())
    where project.id = project_id
      and project.client_id = (select auth.uid())
      and profile.role = 'client'
      and profile.role_confirmed
  ))
  with check (exists (
    select 1 from public.projects project
    join public.profiles profile on profile.id = (select auth.uid())
    where project.id = project_id
      and project.client_id = (select auth.uid())
      and profile.role = 'client'
      and profile.role_confirmed
  ));

drop policy if exists "Clients delete milestones on their projects" on public.project_milestones;
create policy "Clients delete milestones on their projects"
  on public.project_milestones for delete to authenticated
  using (exists (
    select 1 from public.projects project
    join public.profiles profile on profile.id = (select auth.uid())
    where project.id = project_id
      and project.client_id = (select auth.uid())
      and profile.role = 'client'
      and profile.role_confirmed
  ));

create or replace function public.set_project_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_project_updated_at();

drop trigger if exists project_milestones_set_updated_at on public.project_milestones;
create trigger project_milestones_set_updated_at
  before update on public.project_milestones
  for each row execute function public.set_project_updated_at();

create or replace function public.normalize_project_skills()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.required_skills := coalesce(
    (select array_agg(skill order by skill)
     from (
       select distinct lower(trim(raw_skill)) as skill
       from unnest(coalesce(new.required_skills, array[]::text[])) as skills(raw_skill)
       where trim(raw_skill) <> ''
     ) normalized),
    array[]::text[]
  );
  if cardinality(new.required_skills) > 20
     or exists (select 1 from unnest(new.required_skills) as skills(skill) where char_length(skill) > 40) then
    raise exception 'Use at most 20 skills, each 40 characters or fewer';
  end if;
  return new;
end;
$$;

drop trigger if exists projects_normalize_skills on public.projects;
create trigger projects_normalize_skills
  before insert or update of required_skills on public.projects
  for each row execute function public.normalize_project_skills();

-- Keep milestone dates and allocation within their parent project's constraints,
-- including writes made directly through the Supabase Data API.
create or replace function public.validate_project_milestone()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  project_budget numeric(20, 9);
  project_deadline date;
  allocated numeric(20, 9);
begin
  select project.budget_amount, project.deadline
    into project_budget, project_deadline
    from public.projects project
   where project.id = new.project_id
   for update;
  if not found then
    raise exception 'Project not found';
  end if;
  if new.due_date > project_deadline then
    raise exception 'Milestone due dates must be on or before the project deadline';
  end if;
  select coalesce(sum(milestone.amount), 0)
    into allocated
    from public.project_milestones milestone
   where milestone.project_id = new.project_id
     and milestone.id <> new.id;
  if allocated + new.amount > project_budget then
    raise exception 'Milestone allocations cannot exceed the project budget';
  end if;
  return new;
end;
$$;

drop trigger if exists project_milestones_validate on public.project_milestones;
create trigger project_milestones_validate
  before insert or update of project_id, amount, due_date on public.project_milestones
  for each row execute function public.validate_project_milestone();

create or replace function public.validate_project_budget_and_deadline()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allocated numeric(20, 9);
  latest_milestone_due date;
begin
  if tg_op = 'INSERT' then
    if new.deadline < current_date then
      raise exception 'Project deadline must be today or later';
    end if;
  elsif new.deadline is distinct from old.deadline then
    if new.deadline < current_date then
      raise exception 'Project deadline must be today or later';
    end if;
  end if;
  if tg_op = 'UPDATE'
     and (new.budget_amount is distinct from old.budget_amount
       or new.deadline is distinct from old.deadline) then
    select coalesce(sum(milestone.amount), 0), max(milestone.due_date)
      into allocated, latest_milestone_due
      from public.project_milestones milestone
     where milestone.project_id = new.id;
    if allocated > new.budget_amount then
      raise exception 'Project budget cannot be lower than milestone allocations';
    end if;
    if latest_milestone_due is not null and latest_milestone_due > new.deadline then
      raise exception 'Project deadline cannot precede a milestone due date';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists projects_validate_budget_deadline on public.projects;
create trigger projects_validate_budget_deadline
  before insert or update of budget_amount, deadline on public.projects
  for each row execute function public.validate_project_budget_and_deadline();

-- This tightly-scoped definer function is the only write path for authenticated
-- users. It validates the caller's confirmed role, derives uid from the JWT, and
-- creates the project and milestones in one transaction.
-- Remove the earlier six-argument overload, which does not accept p_status and
-- causes PostgREST to reject the current form's seven-argument RPC call.
drop function if exists public.create_project_with_milestones(text, text, numeric, date, text[], jsonb);

create or replace function public.create_project_with_milestones(
  p_title text,
  p_description text,
  p_budget_amount numeric,
  p_deadline date,
  p_required_skills text[],
  p_status text,
  p_milestones jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_project_id uuid;
  milestone jsonb;
  milestone_amount numeric;
  milestone_due_date date;
  total_allocation numeric(20, 9) := 0;
  clean_skills text[];
  milestone_count integer;
  sequence integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if not exists (
    select 1 from public.profiles profile
    where profile.id = current_user_id
      and profile.role = 'client'
      and profile.role_confirmed
  ) then
    raise exception 'A confirmed Client profile is required to create a project';
  end if;
  if p_title is null or char_length(trim(p_title)) not between 1 and 120 then
    raise exception 'Project title is required and must be 120 characters or fewer';
  end if;
  if p_description is null or char_length(trim(p_description)) not between 1 and 5000 then
    raise exception 'Project description is required and must be 5000 characters or fewer';
  end if;
  if p_budget_amount is null or p_budget_amount <= 0 or p_budget_amount <> round(p_budget_amount, 9) then
    raise exception 'Budget must be positive and use at most 9 decimal places';
  end if;
  if p_deadline is null or p_deadline < current_date then
    raise exception 'Project deadline must be today or later';
  end if;
  if p_status is null or p_status not in ('draft', 'open') then
    raise exception 'New projects can only be saved as Draft or published as Open';
  end if;
  clean_skills := coalesce(
    (select array_agg(skill order by skill)
     from (
       select distinct lower(trim(raw_skill)) as skill
       from unnest(coalesce(p_required_skills, array[]::text[])) as skills(raw_skill)
       where trim(raw_skill) <> ''
     ) normalized),
    array[]::text[]
  );
  if cardinality(clean_skills) > 20
     or exists (select 1 from unnest(clean_skills) as skills(skill) where char_length(skill) > 40) then
    raise exception 'Use at most 20 skills, each 40 characters or fewer';
  end if;
  if p_milestones is null or jsonb_typeof(p_milestones) <> 'array' then
    raise exception 'Milestones must be supplied as a list';
  end if;
  milestone_count := jsonb_array_length(p_milestones);
  if milestone_count < 1 or milestone_count > 50 then
    raise exception 'A project needs between 1 and 50 milestones';
  end if;

  for milestone in select value from jsonb_array_elements(p_milestones) as items(value)
  loop
    if jsonb_typeof(milestone) <> 'object'
       or nullif(trim(milestone ->> 'title'), '') is null
       or char_length(trim(milestone ->> 'title')) > 120
       or char_length(coalesce(milestone ->> 'description', '')) > 2000
       or jsonb_typeof(milestone -> 'amount') is distinct from 'number'
       or nullif(milestone ->> 'due_date', '') is null then
      raise exception 'Each milestone needs a title, positive amount, valid due date, and description under 2000 characters';
    end if;
    milestone_amount := (milestone ->> 'amount')::numeric;
    milestone_due_date := (milestone ->> 'due_date')::date;
    if milestone_amount <= 0 or milestone_amount <> round(milestone_amount, 9) then
      raise exception 'Milestone amounts must be positive and use at most 9 decimal places';
    end if;
    if milestone_due_date < current_date or milestone_due_date > p_deadline then
      raise exception 'Milestone due dates must be today or later and on or before the project deadline';
    end if;
    total_allocation := total_allocation + milestone_amount;
  end loop;
  if total_allocation > p_budget_amount then
    raise exception 'Milestone allocations cannot exceed the project budget';
  end if;

  insert into public.projects (
    client_id, title, description, budget_amount, budget_currency,
    deadline, required_skills, status
  ) values (
    current_user_id, trim(p_title), trim(p_description), p_budget_amount, 'SOL',
    p_deadline, clean_skills, p_status
  ) returning id into new_project_id;

  for milestone in
    select value from jsonb_array_elements(p_milestones) with ordinality as items(value, ordinal)
    order by ordinal
  loop
    sequence := sequence + 1;
    insert into public.project_milestones (
      project_id, title, description, amount, currency, due_date, sequence_number
    ) values (
      new_project_id,
      trim(milestone ->> 'title'),
      coalesce(trim(milestone ->> 'description'), ''),
      (milestone ->> 'amount')::numeric,
      'SOL',
      (milestone ->> 'due_date')::date,
      sequence
    );
  end loop;
  return new_project_id;
end;
$$;

revoke all on function public.create_project_with_milestones(text, text, numeric, date, text[], text, jsonb) from public, anon;
grant execute on function public.create_project_with_milestones(text, text, numeric, date, text[], text, jsonb) to authenticated;

-- Make the newly installed RPC signature visible to PostgREST immediately.
notify pgrst, 'reload schema';
