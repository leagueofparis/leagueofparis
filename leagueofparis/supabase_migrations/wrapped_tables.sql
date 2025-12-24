-- Create wrapped_collections table
CREATE TABLE IF NOT EXISTS wrapped_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    period TEXT,
    description TEXT,
    cover_image TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wrapped_stats table
CREATE TABLE IF NOT EXISTS wrapped_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wrapped_collection_id UUID NOT NULL REFERENCES wrapped_collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', NULL)),
    media_url TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    source TEXT DEFAULT 'manual',
    api_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wrapped_collections_published ON wrapped_collections(is_published, year DESC);
CREATE INDEX IF NOT EXISTS idx_wrapped_stats_collection_id ON wrapped_stats(wrapped_collection_id);
CREATE INDEX IF NOT EXISTS idx_wrapped_stats_order ON wrapped_stats(wrapped_collection_id, "order");

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_wrapped_collections_updated_at BEFORE UPDATE ON wrapped_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wrapped_stats_updated_at BEFORE UPDATE ON wrapped_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

