-- ============================================
-- Migration: Add JWT auth support + invite codes
-- Run this AFTER the base schema is already in Supabase
-- ============================================

-- Remove auth.users dependency (for custom JWT auth)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash text;

-- Add invite codes to groups for the join flow
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code text UNIQUE DEFAULT substring(md5(random()::text), 1, 8);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS max_members integer DEFAULT 10;

-- Ensure reputation_scores has default rows (trigger on profile insert)
CREATE OR REPLACE FUNCTION create_reputation_on_signup()
RETURNS trigger AS $$
BEGIN
  INSERT INTO reputation_scores (user_id, score) VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_reputation_on_signup();

-- Auto-complete self-validated habit logs
CREATE OR REPLACE FUNCTION auto_complete_self_log()
RETURNS trigger AS $$
DECLARE
  habit_val_type text;
BEGIN
  SELECT validation_type INTO habit_val_type FROM habits WHERE id = NEW.habit_id;
  IF habit_val_type = 'self' THEN
    NEW.status := 'self_completed';
    NEW.validated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_habit_log_insert ON habit_logs;
CREATE TRIGGER before_habit_log_insert
  BEFORE INSERT ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION auto_complete_self_log();

-- Update reputation + group points on completed log
CREATE OR REPLACE FUNCTION on_habit_log_completed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status IN ('self_completed', 'approved') AND (OLD IS NULL OR OLD.status = 'pending') THEN
    -- Add reputation
    INSERT INTO reputation_scores (user_id, score) VALUES (NEW.user_id, 5)
    ON CONFLICT (user_id) DO UPDATE SET score = reputation_scores.score + 5, updated_at = now();

    -- Add group points if group habit
    IF NEW.group_id IS NOT NULL THEN
      INSERT INTO group_points (group_id, points) VALUES (NEW.group_id, 5)
      ON CONFLICT (group_id) DO UPDATE SET points = group_points.points + 5, updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_log_completed_insert ON habit_logs;
CREATE TRIGGER on_log_completed_insert
  AFTER INSERT ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION on_habit_log_completed();

DROP TRIGGER IF EXISTS on_log_completed_update ON habit_logs;
CREATE TRIGGER on_log_completed_update
  AFTER UPDATE OF status ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION on_habit_log_completed();

-- Check approval threshold and update habit_log status
CREATE OR REPLACE FUNCTION check_approval_threshold()
RETURNS trigger AS $$
DECLARE
  total_members integer;
  total_votes integer;
  approve_count integer;
  log_record record;
BEGIN
  SELECT * INTO log_record FROM habit_logs WHERE id = NEW.habit_log_id;

  SELECT count(*) INTO total_members
  FROM group_members
  WHERE group_id = log_record.group_id AND user_id != log_record.user_id;

  SELECT count(*), count(*) FILTER (WHERE decision = 'approved')
  INTO total_votes, approve_count
  FROM approvals WHERE habit_log_id = NEW.habit_log_id;

  IF total_votes >= GREATEST(total_members / 2, 1) THEN
    IF approve_count > total_votes / 2 THEN
      UPDATE habit_logs SET status = 'approved', validated_at = now() WHERE id = NEW.habit_log_id;
    ELSE
      UPDATE habit_logs SET status = 'rejected', validated_at = now() WHERE id = NEW.habit_log_id;
      -- Penalty for rejected
      UPDATE reputation_scores SET score = GREATEST(0, score - 10), updated_at = now()
      WHERE user_id = log_record.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_approval_vote ON approvals;
CREATE TRIGGER on_approval_vote
  AFTER INSERT ON approvals
  FOR EACH ROW EXECUTE FUNCTION check_approval_threshold();

-- Generate notification when habit is completed
CREATE OR REPLACE FUNCTION notify_group_on_completion()
RETURNS trigger AS $$
DECLARE
  habit_title text;
  user_name text;
  member record;
BEGIN
  IF NEW.status IN ('self_completed', 'approved') AND (OLD IS NULL OR OLD.status = 'pending') THEN
    IF NEW.group_id IS NOT NULL THEN
      SELECT title INTO habit_title FROM habits WHERE id = NEW.habit_id;
      SELECT name INTO user_name FROM profiles WHERE id = NEW.user_id;

      FOR member IN
        SELECT user_id FROM group_members
        WHERE group_id = NEW.group_id AND user_id != NEW.user_id
      LOOP
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (
          member.user_id, 'social',
          'Group Activity',
          user_name || ' completed "' || habit_title || '"! Keep up the momentum!'
        );
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_log_notify_insert ON habit_logs;
CREATE TRIGGER on_log_notify_insert
  AFTER INSERT ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION notify_group_on_completion();

DROP TRIGGER IF EXISTS on_log_notify_update ON habit_logs;
CREATE TRIGGER on_log_notify_update
  AFTER UPDATE OF status ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION notify_group_on_completion();
