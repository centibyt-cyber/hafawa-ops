-- A separate protected workspace for personnel documents. Existing operations
-- app_state data and policies are not modified. Access is seeded once from the
-- registered administrator roster; client-editable roles are never consulted
-- by these policies after migration.
create table public.hf_tracking_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.hf_tracking_access enable row level security;
revoke all on public.hf_tracking_access from anon, authenticated;
grant select on public.hf_tracking_access to authenticated;
create policy tracking_access_self on public.hf_tracking_access for select to authenticated
  using (user_id = (select auth.uid()));

insert into public.hf_tracking_access(user_id)
select distinct a.id from public.app_state s
cross join lateral jsonb_array_elements(s.data) u
join auth.users a on lower(a.email) = lower(u->>'email')
where s.key = 'users' and u->>'role' = 'admin';
do $$ begin
  if not exists (select 1 from public.hf_tracking_access) then
    raise exception 'No registered Hafawa administrator found; refusing inaccessible tracking setup';
  end if;
end $$;

create table public.hf_employee_tracking (
  id integer primary key check (id = 1),
  data jsonb not null check (
    jsonb_typeof(data) = 'object' and
    data ? 'employees' and jsonb_typeof(data->'employees') = 'array' and
    data ? 'types' and jsonb_typeof(data->'types') = 'array'
  ),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.hf_employee_tracking enable row level security;
revoke all on public.hf_employee_tracking from anon, authenticated;
grant select on public.hf_employee_tracking to authenticated;
grant update(data) on public.hf_employee_tracking to authenticated;
create policy tracking_read on public.hf_employee_tracking for select to authenticated
  using (exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())));
create policy tracking_write on public.hf_employee_tracking for update to authenticated
  using (exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())))
  with check (exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())));

create function public.hf_tracking_revision() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;
revoke all on function public.hf_tracking_revision() from public;
create trigger hf_tracking_revision before update on public.hf_employee_tracking
for each row execute function public.hf_tracking_revision();

insert into public.hf_employee_tracking(id,data) values (1, '{"schemaVersion":1,"types":[{"id":"iqama","name":"الإقامة","nameEn":"Iqama","kind":"expiry","alertDays":30,"all":true,"dashboard":true},{"id":"run-pass","name":"الرون باس","nameEn":"Run pass","kind":"expiry","alertDays":10,"all":true,"dashboard":true},{"id":"municipal","name":"بطاقة البلدية","nameEn":"Municipal card","kind":"status","labels":"possession","all":true,"dashboard":true},{"id":"analysis","name":"التحليل","nameEn":"Medical test","kind":"status","labels":"completion","all":true,"dashboard":true}],"employees":[]}');

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('hf-employee-documents','hf-employee-documents',false,5242880,
  array['application/pdf','image/jpeg','image/png','image/webp']);
create policy tracking_file_read on storage.objects for select to authenticated
  using (bucket_id = 'hf-employee-documents' and exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())));
create policy tracking_file_create on storage.objects for insert to authenticated
  with check (bucket_id = 'hf-employee-documents' and exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())));
create policy tracking_file_delete on storage.objects for delete to authenticated
  using (bucket_id = 'hf-employee-documents' and exists (select 1 from public.hf_tracking_access where user_id = (select auth.uid())));
-- Uploads use unique paths and never upsert existing files.
