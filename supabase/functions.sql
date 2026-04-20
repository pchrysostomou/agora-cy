-- Add this after the schema in Supabase SQL Editor
-- OR run separately

-- View counter function (safe increment)
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = listing_id;
END;
$$;

-- Full-text search helper (if textSearch causes issues)
-- This adds a generated column so we can also do ILIKE searches:
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('simple', title || ' ' || COALESCE(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON listings USING GIN(search_vector);
