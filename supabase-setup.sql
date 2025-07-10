-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_entries_timestamp ON entries(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now)
-- You can make this more restrictive later if needed
CREATE POLICY "Allow all operations on entries" ON entries
  FOR ALL USING (true); 