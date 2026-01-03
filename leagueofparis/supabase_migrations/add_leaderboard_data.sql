-- Add leaderboard_data column to wrapped_stats table
-- This allows stats to optionally be a leaderboard or stats list with multiple entries

ALTER TABLE wrapped_stats 
ADD COLUMN IF NOT EXISTS leaderboard_data JSONB DEFAULT NULL;

-- Add a stat_type column to distinguish between normal stats, leaderboards, and stats lists
-- If updating an existing constraint, drop it first
ALTER TABLE wrapped_stats DROP CONSTRAINT IF EXISTS wrapped_stats_stat_type_check;

ALTER TABLE wrapped_stats 
ADD COLUMN IF NOT EXISTS stat_type TEXT DEFAULT 'normal';

ALTER TABLE wrapped_stats 
ADD CONSTRAINT wrapped_stats_stat_type_check CHECK (stat_type IN ('normal', 'leaderboard', 'stats_list'));

-- Example leaderboard_data structure (used for both leaderboard and stats_list):
-- [
--   { "name": "Player1", "value": "500", "image_url": "https://..." },
--   { "name": "Player2", "value": "450", "image_url": null },
--   { "name": "Pee Breaks", "value": "94" }
-- ]

COMMENT ON COLUMN wrapped_stats.leaderboard_data IS 'JSON array of entries, each with name, value, and optional image_url';
COMMENT ON COLUMN wrapped_stats.stat_type IS 'Type of stat: normal (single value), leaderboard (ranked list), or stats_list (simple list of stats)';

