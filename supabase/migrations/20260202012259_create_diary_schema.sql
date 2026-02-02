/*
  # Create Personal Diary Schema

  1. New Tables
    - `entries` - Main diary entries for self-reflection
    - `moods` - Daily mood tracking
    - `tasks` - Accomplished tasks tracker
    - `schedule_items` - Daily plans and schedule entries
    - `tags` - Tags for organizing entries
    - `entry_tags` - Junction table for entry-tag relationships

  2. Security
    - Enable RLS on all tables
    - Each user can only access their own data
    - Authenticated users only

  3. Features
    - Timestamps for all entries
    - Mood tracking with emotions and intensity
    - Task completion tracking
    - Schedule management
    - Tag-based organization
*/

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  entry_type text NOT NULL DEFAULT 'reflection', -- reflection, analysis, memory
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create moods table
CREATE TABLE IF NOT EXISTS moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  primary_mood text NOT NULL, -- happy, sad, anxious, calm, excited, neutral, frustrated
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  description text,
  triggers text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed_at timestamptz,
  scheduled_date date,
  category text, -- work, personal, health, learning
  priority integer DEFAULT 0, -- 0 = low, 1 = medium, 2 = high
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create schedule_items table
CREATE TABLE IF NOT EXISTS schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  start_time time,
  end_time time,
  category text, -- work, personal, health, learning, other
  status text DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create entry_tags junction table
CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for entries
CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries"
  ON entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for moods
CREATE POLICY "Users can view own moods"
  ON moods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create moods"
  ON moods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods"
  ON moods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods"
  ON moods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for schedule_items
CREATE POLICY "Users can view own schedule"
  ON schedule_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedule items"
  ON schedule_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule"
  ON schedule_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule"
  ON schedule_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tags
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for entry_tags
CREATE POLICY "Users can view entry tags"
  ON entry_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_tags.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add entry tags"
  ON entry_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_tags.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entry tags"
  ON entry_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = entry_tags.entry_id
      AND entries.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX entries_user_id_idx ON entries(user_id, created_at DESC);
CREATE INDEX moods_user_id_date_idx ON moods(user_id, date DESC);
CREATE INDEX tasks_user_id_completed_idx ON tasks(user_id, completed_at DESC);
CREATE INDEX schedule_items_user_id_date_idx ON schedule_items(user_id, scheduled_date DESC);
CREATE INDEX tags_user_id_idx ON tags(user_id);
