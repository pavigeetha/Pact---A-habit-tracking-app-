-- ============================================
-- Migration V2: Clubs, Leaderboard, Negative Points
-- ============================================

-- Club members
CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Weekly challenges within clubs
CREATE TABLE IF NOT EXISTS club_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES club_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(challenge_id, user_id)
);

-- Ensure clubs table has invite_code
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS invite_code text UNIQUE DEFAULT substring(md5(random()::text), 1, 8);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Ensure groups has club_id
ALTER TABLE groups ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

-- Points audit log (tracks positive and negative point changes)
CREATE TABLE IF NOT EXISTS group_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  habit_id uuid REFERENCES habits(id) ON DELETE SET NULL,
  points_delta integer NOT NULL,
  reason text CHECK (reason IN ('habit_completed', 'habit_missed', 'challenge_bonus')),
  log_date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

-- Update the habit completion trigger to also log points
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

      -- Log the point change
      INSERT INTO group_points_log (group_id, user_id, habit_id, points_delta, reason, log_date)
      VALUES (NEW.group_id, NEW.user_id, NEW.habit_id, 5, 'habit_completed', current_date);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
