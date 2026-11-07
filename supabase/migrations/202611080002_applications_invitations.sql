-- Freelancer applications, Client invitations, project assignments and in-app notifications.
-- No wallet, escrow or payment operations are implemented by this migration.

create table if not exists public.project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  freelancer_id uuid not null references auth.users(id) on delete cascade,
  proposal text not null check (char_length(trim(proposal)) between 1 and 5000),
  proposed_budget numeric(20, 9) check (proposed_budget is null or proposed_budget > 0),
  estimated_completion_date date,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_applications_once_per_freelancer unique (project_id, freelancer_id)
);

create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  freelancer_id uuid not null references auth.users(id) on delete cascade,
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_invitations_client_freelancer_distinct check (client_id <> freelancer_id)
);

create unique index if not exists project_invitations_one_pending_idx
  on public.project_invitations (project_id, freelancer_id) where status = 'pending';
create index if not exists project_invitations_freelancer_created_idx
  on public.project_invitations (freelancer_id, created_at desc);
create index if not exists project_applications_client_status_idx
  on public.project_applications (project_id, status, created_at desc);

create table if not exists public.project_memberships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  freelancer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_memberships_client_freelancer_distinct check (client_id <> freelancer_id)
);

create unique index if not exists project_memberships_one_active_freelancer_idx
  on public.project_memberships (project_id) where status = 'active';
create index if not exists project_memberships_freelancer_status_idx
  on public.project_memberships (freelancer_id, status, created_at desc);
create index if not exists project_memberships_client_status_idx
  on public.project_memberships (client_id, status, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null check (kind in (
    'application_received', 'application_accepted', 'application_rejected',
    'invitation_received', 'invitation_accepted', 'invitation_declined'
  )),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_recent_idx
  on public.notifications (user_id, created_at desc);

alter table public.project_applications enable row level security;
alter table public.project_invitations enable row level security;
alter table public.project_memberships enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.project_applications, public.project_invitations,
  public.project_memberships, public.notifications from anon, authenticated;
grant select on table public.project_applications, public.project_invitations,
  public.project_memberships, public.notifications to authenticated;

drop policy if exists "Freelancers and owning clients read project applications" on public.project_applications;
create policy "Freelancers and owning clients read project applications"
  on public.project_applications for select to authenticated
  using (
    (freelancer_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'freelancer' and profile.role_confirmed
    ))
    or exists (
      select 1 from public.projects project
      join public.profiles profile on profile.id = (select auth.uid())
      where project.id = project_applications.project_id
        and project.client_id = (select auth.uid())
        and profile.role = 'client' and profile.role_confirmed
    )
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'admin' and profile.role_confirmed
    )
  );

drop policy if exists "Participants read project invitations" on public.project_invitations;
create policy "Participants read project invitations"
  on public.project_invitations for select to authenticated
  using (
    (freelancer_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'freelancer' and profile.role_confirmed
    ))
    or (client_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'client' and profile.role_confirmed
    ))
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'admin' and profile.role_confirmed
    )
  );

drop policy if exists "Project participants read memberships" on public.project_memberships;
create policy "Project participants read memberships"
  on public.project_memberships for select to authenticated
  using (
    (client_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'client' and profile.role_confirmed
    ))
    or (freelancer_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'freelancer' and profile.role_confirmed
    ))
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'admin' and profile.role_confirmed
    )
  );

drop policy if exists "Users read their notifications" on public.notifications;
create policy "Users read their notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

-- Assigned freelancers can read in-progress project details and milestones.
drop policy if exists "Clients read their projects and freelancers discover open projects" on public.projects;
create policy "Clients read their projects and freelancers discover open projects"
  on public.projects for select to authenticated
  using (
    (client_id = (select auth.uid()) and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'client' and profile.role_confirmed
    ))
    or (status = 'open' and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'freelancer' and profile.role_confirmed
    ))
    or exists (
      select 1 from public.project_memberships membership
      join public.profiles profile on profile.id = (select auth.uid())
      where membership.project_id = projects.id
        and membership.freelancer_id = (select auth.uid())
        and membership.status in ('active', 'completed')
        and profile.role = 'freelancer' and profile.role_confirmed
    )
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role = 'admin' and profile.role_confirmed
    )
  );

create or replace function public.set_workflow_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists project_applications_set_updated_at on public.project_applications;
create trigger project_applications_set_updated_at before update on public.project_applications
  for each row execute function public.set_workflow_updated_at();
drop trigger if exists project_invitations_set_updated_at on public.project_invitations;
create trigger project_invitations_set_updated_at before update on public.project_invitations
  for each row execute function public.set_workflow_updated_at();
drop trigger if exists project_memberships_set_updated_at on public.project_memberships;
create trigger project_memberships_set_updated_at before update on public.project_memberships
  for each row execute function public.set_workflow_updated_at();

-- Submit as the signed-in Freelancer; project and user IDs are verified server-side.
create or replace function public.submit_project_application(
  p_project_id uuid, p_proposal text, p_proposed_budget numeric, p_estimated_completion_date date
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  project_client_id uuid;
  project_deadline date;
  new_application_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'A confirmed Freelancer profile is required'; end if;
  if p_proposal is null or char_length(trim(p_proposal)) not between 1 and 5000 then
    raise exception 'Proposal is required and must be 5000 characters or fewer';
  end if;
  if p_proposed_budget is not null and (p_proposed_budget <= 0 or p_proposed_budget <> round(p_proposed_budget, 9)) then
    raise exception 'Proposed budget must be positive and use at most 9 decimal places';
  end if;
  select project.client_id, project.deadline into project_client_id, project_deadline from public.projects project
    where project.id = p_project_id and project.status = 'open' for update;
  if not found then raise exception 'This project is no longer open for applications'; end if;
  if p_estimated_completion_date is not null and (p_estimated_completion_date < current_date or p_estimated_completion_date > project_deadline) then
    raise exception 'Estimated completion date must be today or on or before the project deadline';
  end if;
  if exists (select 1 from public.project_memberships membership
    where membership.project_id = p_project_id and membership.status = 'active') then
    raise exception 'This project already has an assigned Freelancer';
  end if;
  insert into public.project_applications (
    project_id, freelancer_id, proposal, proposed_budget, estimated_completion_date
  ) values (
    p_project_id, current_user_id, trim(p_proposal), p_proposed_budget, p_estimated_completion_date
  ) returning id into new_application_id;
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    select project_client_id, current_user_id, p_project_id, 'application_received',
      'New project application', 'A Freelancer applied to your project.';
  return new_application_id;
exception when unique_violation then
  raise exception 'You have already applied to this project';
end;
$$;

create or replace function public.withdraw_project_application(p_application_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'A confirmed Freelancer profile is required'; end if;
  update public.project_applications application set status = 'withdrawn'
    where application.id = p_application_id and application.freelancer_id = current_user_id
      and application.status = 'pending';
  if not found then raise exception 'Only your pending applications can be withdrawn'; end if;
end;
$$;

-- Acceptance creates one membership, closes competing applications/invitations and
-- moves the project to in_progress in the same database transaction.
create or replace function public.decide_project_application(p_application_id uuid, p_decision text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  project_id_value uuid;
  project_status_value text;
  freelancer_id_value uuid;
  new_membership_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  if p_decision is null or p_decision not in ('accept', 'reject') then raise exception 'Decision must be accept or reject'; end if;
  select project.id, project.status into project_id_value, project_status_value
    from public.project_applications application
    join public.projects project on project.id = application.project_id
    where application.id = p_application_id and project.client_id = current_user_id
    for update of project;
  if not found then raise exception 'Application not found for a project you own'; end if;
  select application.freelancer_id into freelancer_id_value
    from public.project_applications application
    where application.id = p_application_id and application.status = 'pending'
    for update;
  if not found then raise exception 'This application is no longer pending'; end if;
  if project_status_value <> 'open' then raise exception 'Only open projects can accept or reject applications'; end if;

  if p_decision = 'reject' then
    update public.project_applications set status = 'rejected' where id = p_application_id;
    insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
      values (freelancer_id_value, current_user_id, project_id_value, 'application_rejected',
        'Application update', 'The Client declined your application.');
    return p_application_id;
  end if;

  if exists (select 1 from public.project_memberships membership
    where membership.project_id = project_id_value and membership.status = 'active') then
    raise exception 'This project already has an active Freelancer';
  end if;
  insert into public.project_memberships (project_id, client_id, freelancer_id, status)
    values (project_id_value, current_user_id, freelancer_id_value, 'active')
    returning id into new_membership_id;
  update public.project_applications set status = 'accepted' where id = p_application_id;
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    values (freelancer_id_value, current_user_id, project_id_value, 'application_accepted',
      'Application accepted', 'The Client accepted your application. You are assigned to the project.');
  with rejected as (
    update public.project_applications set status = 'rejected'
      where project_id = project_id_value and id <> p_application_id and status = 'pending'
      returning freelancer_id
  )
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    select rejected.freelancer_id, current_user_id, project_id_value, 'application_rejected',
      'Application update', 'Another Freelancer was selected for this project.'
    from rejected;
  update public.project_invitations set status = 'cancelled'
    where project_id = project_id_value and status = 'pending';
  update public.projects set status = 'in_progress' where id = project_id_value;
  return new_membership_id;
end;
$$;

create or replace function public.send_project_invitation(p_project_id uuid, p_freelancer_id uuid, p_message text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  invitation_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  if p_freelancer_id is null or p_freelancer_id = current_user_id or not exists (
    select 1 from public.profiles profile where profile.id = p_freelancer_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'Choose an eligible confirmed Freelancer'; end if;
  if p_message is not null and char_length(p_message) > 2000 then raise exception 'Invitation message must be 2000 characters or fewer'; end if;
  perform 1 from public.projects project where project.id = p_project_id
    and project.client_id = current_user_id and project.status = 'open' for update;
  if not found then raise exception 'Only your open projects can invite Freelancers'; end if;
  if exists (select 1 from public.project_memberships membership where membership.project_id = p_project_id and membership.status = 'active') then
    raise exception 'This project already has an assigned Freelancer';
  end if;
  insert into public.project_invitations (project_id, client_id, freelancer_id, message)
    values (p_project_id, current_user_id, p_freelancer_id, nullif(trim(p_message), ''))
    returning id into invitation_id;
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    values (p_freelancer_id, current_user_id, p_project_id, 'invitation_received',
      'Project invitation', 'A Client invited you to review a project.');
  return invitation_id;
exception when unique_violation then
  raise exception 'There is already a pending invitation for this Freelancer and project';
end;
$$;

create or replace function public.respond_project_invitation(p_invitation_id uuid, p_decision text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  project_id_value uuid;
  project_client_id_value uuid;
  client_id_value uuid;
  project_status_value text;
  invitation_status_value text;
  new_membership_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'A confirmed Freelancer profile is required'; end if;
  if p_decision is null or p_decision not in ('accept', 'decline') then raise exception 'Decision must be accept or decline'; end if;
  select invitation.project_id, invitation.client_id into project_id_value, client_id_value
    from public.project_invitations invitation
    where invitation.id = p_invitation_id and invitation.freelancer_id = current_user_id;
  if not found then raise exception 'Invitation not found'; end if;
  select project.client_id, project.status into project_client_id_value, project_status_value from public.projects project
    where project.id = project_id_value for update;
  select invitation.status into invitation_status_value
    from public.project_invitations invitation
    where invitation.id = p_invitation_id and invitation.freelancer_id = current_user_id for update;
  if not found or invitation_status_value <> 'pending' then raise exception 'This invitation is no longer pending'; end if;
  if client_id_value is distinct from project_client_id_value then raise exception 'Invitation does not match the project owner'; end if;
  if project_status_value <> 'open' then raise exception 'This project is no longer open'; end if;

  if p_decision = 'decline' then
    update public.project_invitations set status = 'declined' where id = p_invitation_id;
    insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
      values (client_id_value, current_user_id, project_id_value, 'invitation_declined',
        'Invitation declined', 'The Freelancer declined your invitation.');
    return p_invitation_id;
  end if;
  if exists (select 1 from public.project_memberships membership where membership.project_id = project_id_value and membership.status = 'active') then
    raise exception 'This project already has an active Freelancer';
  end if;
  insert into public.project_memberships (project_id, client_id, freelancer_id, status)
    values (project_id_value, client_id_value, current_user_id, 'active') returning id into new_membership_id;
  update public.project_invitations set status = 'accepted' where id = p_invitation_id;
  update public.project_invitations set status = 'cancelled'
    where project_id = project_id_value and id <> p_invitation_id and status = 'pending';
  update public.project_applications set status = 'accepted'
    where project_id = project_id_value and freelancer_id = current_user_id and status = 'pending';
  with rejected as (
    update public.project_applications set status = 'rejected'
      where project_id = project_id_value and freelancer_id <> current_user_id and status = 'pending'
      returning freelancer_id
  )
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    select rejected.freelancer_id, current_user_id, project_id_value, 'application_rejected',
      'Application update', 'Another Freelancer was selected for this project.'
    from rejected;
  update public.projects set status = 'in_progress' where id = project_id_value;
  insert into public.notifications (user_id, actor_id, project_id, kind, title, body)
    values (client_id_value, current_user_id, project_id_value, 'invitation_accepted',
      'Invitation accepted', 'The Freelancer accepted your invitation and joined the project.');
  return new_membership_id;
end;
$$;

create or replace function public.cancel_project_invitation(p_invitation_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  update public.project_invitations set status = 'cancelled'
    where id = p_invitation_id and client_id = current_user_id and status = 'pending';
  if not found then raise exception 'Only your pending invitations can be cancelled'; end if;
end;
$$;

-- Narrow profile fields are returned only to the owner of the specified open project;
-- public profile table policies remain unchanged.
create or replace function public.list_eligible_freelancers(p_project_id uuid)
returns table (freelancer_id uuid, full_name text, avatar_url text, has_pending_application boolean, has_pending_invitation boolean, assigned_to_project boolean)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  if not exists (select 1 from public.projects project where project.id = p_project_id
      and project.client_id = current_user_id and project.status = 'open') then
    raise exception 'Freelancer discovery is available only for your open projects';
  end if;
  return query
    select profile.id, coalesce(nullif(profile.full_name, ''), 'Freelancer'), profile.avatar_url,
      exists (select 1 from public.project_applications application where application.project_id = p_project_id and application.freelancer_id = profile.id and application.status = 'pending'),
      exists (select 1 from public.project_invitations invitation where invitation.project_id = p_project_id and invitation.freelancer_id = profile.id and invitation.status = 'pending'),
      exists (select 1 from public.project_memberships membership where membership.project_id = p_project_id and membership.freelancer_id = profile.id and membership.status = 'active')
    from public.profiles profile
    where profile.role = 'freelancer' and profile.role_confirmed
    order by lower(coalesce(nullif(profile.full_name, ''), 'Freelancer'))
    limit 200;
end;
$$;

create or replace function public.list_client_applications()
returns table (
  application_id uuid, project_id uuid, project_title text, freelancer_id uuid,
  freelancer_name text, freelancer_avatar_url text, proposal text, proposed_budget numeric,
  estimated_completion_date date, application_status text, project_status text,
  applied_at timestamptz, assigned boolean
)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  return query
    select application.id, project.id, project.title, application.freelancer_id,
      coalesce(nullif(profile.full_name, ''), 'Freelancer'), profile.avatar_url,
      application.proposal, application.proposed_budget, application.estimated_completion_date,
      application.status, project.status, application.created_at,
      exists (select 1 from public.project_memberships membership where membership.project_id = project.id and membership.freelancer_id = application.freelancer_id and membership.status = 'active')
    from public.project_applications application
    join public.projects project on project.id = application.project_id and project.client_id = current_user_id
    join public.profiles profile on profile.id = application.freelancer_id
    order by application.created_at desc limit 500;
end;
$$;

create or replace function public.list_client_invitations()
returns table (
  invitation_id uuid, project_id uuid, project_title text, freelancer_id uuid,
  freelancer_name text, freelancer_avatar_url text, message text,
  invitation_status text, invited_at timestamptz
)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  return query
    select invitation.id, project.id, project.title, invitation.freelancer_id,
      coalesce(nullif(profile.full_name, ''), 'Freelancer'), profile.avatar_url,
      invitation.message, invitation.status, invitation.created_at
    from public.project_invitations invitation
    join public.projects project on project.id = invitation.project_id and project.client_id = current_user_id
    join public.profiles profile on profile.id = invitation.freelancer_id
    order by invitation.created_at desc limit 500;
end;
$$;

create or replace function public.list_client_memberships()
returns table (membership_id uuid, project_id uuid, project_title text, freelancer_id uuid, freelancer_name text, freelancer_avatar_url text, membership_status text, assigned_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'client' and profile.role_confirmed
  ) then raise exception 'A confirmed Client profile is required'; end if;
  return query
    select membership.id, project.id, project.title, membership.freelancer_id,
      coalesce(nullif(profile.full_name, ''), 'Freelancer'), profile.avatar_url,
      membership.status, membership.created_at
    from public.project_memberships membership
    join public.projects project on project.id = membership.project_id and project.client_id = current_user_id
    join public.profiles profile on profile.id = membership.freelancer_id
    order by membership.created_at desc limit 500;
end;
$$;

create or replace function public.list_my_applications()
returns table (application_id uuid, project_id uuid, project_title text, proposal text, proposed_budget numeric, estimated_completion_date date, application_status text, applied_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'A confirmed Freelancer profile is required'; end if;
  return query
    select application.id, project.id, project.title, application.proposal,
      application.proposed_budget, application.estimated_completion_date,
      application.status, application.created_at
    from public.project_applications application
    join public.projects project on project.id = application.project_id
    where application.freelancer_id = current_user_id
    order by application.created_at desc limit 500;
end;
$$;

create or replace function public.list_my_invitations()
returns table (invitation_id uuid, project_id uuid, project_title text, project_description text, project_budget numeric, project_deadline date, project_skills text[], client_name text, invitation_message text, invitation_status text, invited_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
      and profile.role = 'freelancer' and profile.role_confirmed
  ) then raise exception 'A confirmed Freelancer profile is required'; end if;
  return query
    select invitation.id, project.id, project.title, project.description,
      project.budget_amount, project.deadline, project.required_skills,
      coalesce(nullif(profile.full_name, ''), 'Client'), invitation.message,
      invitation.status, invitation.created_at
    from public.project_invitations invitation
    join public.projects project on project.id = invitation.project_id
    join public.profiles profile on profile.id = invitation.client_id
    where invitation.freelancer_id = current_user_id
    order by invitation.created_at desc limit 500;
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  update public.notifications set read_at = now()
    where id = p_notification_id and user_id = current_user_id and read_at is null;
end;
$$;

-- All mutations are callable only by authenticated sessions and validate role/ownership internally.
revoke all on function public.submit_project_application(uuid, text, numeric, date) from public, anon;
revoke all on function public.withdraw_project_application(uuid) from public, anon;
revoke all on function public.decide_project_application(uuid, text) from public, anon;
revoke all on function public.send_project_invitation(uuid, uuid, text) from public, anon;
revoke all on function public.respond_project_invitation(uuid, text) from public, anon;
revoke all on function public.cancel_project_invitation(uuid) from public, anon;
revoke all on function public.list_eligible_freelancers(uuid) from public, anon;
revoke all on function public.list_client_applications() from public, anon;
revoke all on function public.list_client_invitations() from public, anon;
revoke all on function public.list_client_memberships() from public, anon;
revoke all on function public.list_my_applications() from public, anon;
revoke all on function public.list_my_invitations() from public, anon;
revoke all on function public.mark_notification_read(uuid) from public, anon;

grant execute on function public.submit_project_application(uuid, text, numeric, date) to authenticated;
grant execute on function public.withdraw_project_application(uuid) to authenticated;
grant execute on function public.decide_project_application(uuid, text) to authenticated;
grant execute on function public.send_project_invitation(uuid, uuid, text) to authenticated;
grant execute on function public.respond_project_invitation(uuid, text) to authenticated;
grant execute on function public.cancel_project_invitation(uuid) to authenticated;
grant execute on function public.list_eligible_freelancers(uuid) to authenticated;
grant execute on function public.list_client_applications() to authenticated;
grant execute on function public.list_client_invitations() to authenticated;
grant execute on function public.list_client_memberships() to authenticated;
grant execute on function public.list_my_applications() to authenticated;
grant execute on function public.list_my_invitations() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;

-- Assigned users can see the in-progress project through the revised projects RLS policy.
notify pgrst, 'reload schema';
