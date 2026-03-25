-- ============================================
-- PACT - Social Habit Tracking App
-- Database Schema (Custom JWT Auth - No Supabase Auth)
-- ============================================

create extension if not exists "pgcrypto";

-- ============================================
-- USERS (custom auth, replaces profiles)
-- ============================================
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password_hash text not null,
  username text unique not null,
  full_name text default '',
  avatar_url text default '',
  reputation_score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ROOMS
-- ============================================
create table rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references users(id) on delete set null,
  invite_code text unique not null default substring(md5(random()::text), 1, 8),
  max_members integer default 10,
  created_at timestamptz default now()
);

-- ============================================
-- ROOM MEMBERS
-- ============================================
create table room_members (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- ============================================
-- HABITS
-- ============================================
create table habits (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  name text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly')),
  validation_type text default 'self' check (validation_type in ('self', 'group')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- CHECK-INS
-- ============================================
create table check_ins (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  proof_url text,
  proof_text text,
  status text default 'pending' check (status in ('pending', 'validated', 'rejected')),
  checked_in_at timestamptz default now()
);

-- ============================================
-- VALIDATIONS (Group Votes)
-- ============================================
create table validations (
  id uuid default gen_random_uuid() primary key,
  check_in_id uuid references check_ins(id) on delete cascade not null,
  voter_id uuid references users(id) on delete cascade not null,
  vote boolean not null,
  created_at timestamptz default now(),
  unique(check_in_id, voter_id)
);

-- ============================================
-- STREAKS
-- ============================================
create table streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_check_in date,
  unique(user_id, habit_id)
);

-- ============================================
-- NUDGES
-- ============================================
create table nudges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete cascade,
  message text not null,
  nudge_type text default 'reminder' check (nudge_type in ('reminder', 'social', 'streak', 'recovery', 'celebration')),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-validate self-reported check-ins
create or replace function auto_validate_self_checkin()
returns trigger as $$
declare
  habit_validation_type text;
begin
  select validation_type into habit_validation_type
  from habits where id = new.habit_id;

  if habit_validation_type = 'self' then
    new.status := 'validated';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger before_checkin_insert
  before insert on check_ins
  for each row execute function auto_validate_self_checkin();

-- Update streak when check-in is validated
create or replace function update_streak_on_checkin()
returns trigger as $$
declare
  existing_streak record;
  today date := current_date;
begin
  if new.status = 'validated' and (old.status is null or old.status != 'validated') then
    select * into existing_streak
    from streaks
    where user_id = new.user_id and habit_id = new.habit_id;

    if existing_streak is null then
      insert into streaks (user_id, habit_id, current_streak, longest_streak, last_check_in)
      values (new.user_id, new.habit_id, 1, 1, today);
    elsif existing_streak.last_check_in = today - interval '1 day' then
      update streaks
      set current_streak = existing_streak.current_streak + 1,
          longest_streak = greatest(existing_streak.longest_streak, existing_streak.current_streak + 1),
          last_check_in = today
      where user_id = new.user_id and habit_id = new.habit_id;
    elsif existing_streak.last_check_in < today - interval '1 day' then
      update streaks
      set current_streak = 1, last_check_in = today
      where user_id = new.user_id and habit_id = new.habit_id;
    end if;

    -- Award reputation
    update users
    set reputation_score = reputation_score + (
      case
        when existing_streak is not null and existing_streak.current_streak >= 7 then 15
        when existing_streak is not null and existing_streak.current_streak >= 3 then 10
        else 5
      end
    )
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_checkin_status_change
  after update of status on check_ins
  for each row execute function update_streak_on_checkin();

-- Also handle self-validated inserts (status is set to 'validated' by before trigger)
create or replace function handle_self_validated_insert()
returns trigger as $$
declare
  existing_streak record;
  today date := current_date;
begin
  if new.status = 'validated' then
    select * into existing_streak
    from streaks
    where user_id = new.user_id and habit_id = new.habit_id;

    if existing_streak is null then
      insert into streaks (user_id, habit_id, current_streak, longest_streak, last_check_in)
      values (new.user_id, new.habit_id, 1, 1, today);
    elsif existing_streak.last_check_in = today - interval '1 day' then
      update streaks
      set current_streak = existing_streak.current_streak + 1,
          longest_streak = greatest(existing_streak.longest_streak, existing_streak.current_streak + 1),
          last_check_in = today
      where user_id = new.user_id and habit_id = new.habit_id;
    elsif existing_streak.last_check_in is null or existing_streak.last_check_in < today - interval '1 day' then
      update streaks
      set current_streak = 1, last_check_in = today
      where user_id = new.user_id and habit_id = new.habit_id;
    end if;

    update users
    set reputation_score = reputation_score + 5
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_self_validated_insert
  after insert on check_ins
  for each row execute function handle_self_validated_insert();

-- Check group validation threshold
create or replace function check_validation_threshold()
returns trigger as $$
declare
  total_members integer;
  total_votes integer;
  approve_votes integer;
  checkin_record record;
begin
  select * into checkin_record from check_ins where id = new.check_in_id;

  select count(*) into total_members
  from room_members rm
  join habits h on h.room_id = rm.room_id
  where h.id = checkin_record.habit_id
  and rm.user_id != checkin_record.user_id;

  select count(*), count(*) filter (where vote = true)
  into total_votes, approve_votes
  from validations
  where check_in_id = new.check_in_id;

  if total_votes >= greatest(total_members / 2, 1) then
    if approve_votes > total_votes / 2 then
      update check_ins set status = 'validated' where id = new.check_in_id;
    elsif total_votes - approve_votes > total_votes / 2 then
      update check_ins set status = 'rejected' where id = new.check_in_id;
      update users
      set reputation_score = greatest(0, reputation_score - 10)
      where id = checkin_record.user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_validation_vote
  after insert on validations
  for each row execute function check_validation_threshold();

-- Generate social nudges on validated check-in
create or replace function generate_social_nudge()
returns trigger as $$
declare
  habit_name text;
  room_id_val uuid;
  checkin_user text;
  member record;
begin
  if new.status = 'validated' and (old.status is null or old.status != 'validated') then
    select h.name, h.room_id into habit_name, room_id_val
    from habits h where h.id = new.habit_id;

    select u.username into checkin_user
    from users u where u.id = new.user_id;

    for member in
      select rm.user_id from room_members rm
      where rm.room_id = room_id_val and rm.user_id != new.user_id
    loop
      insert into nudges (user_id, room_id, message, nudge_type)
      values (
        member.user_id, room_id_val,
        checkin_user || ' just completed "' || habit_name || '"! Keep up the momentum!',
        'social'
      );
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_checkin_validated_nudge
  after update of status on check_ins
  for each row execute function generate_social_nudge();
