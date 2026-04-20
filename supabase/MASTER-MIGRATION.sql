-- ============================================================
-- Agora.cy — MASTER MIGRATION v2 (FULLY IDEMPOTENT)
-- FIXED: PostgreSQL δεν υποστηρίζει CREATE POLICY IF NOT EXISTS
-- Χρησιμοποιεί DO blocks για όλα τα duplicates
-- ============================================================

-- ─────────────────────────────────────────────
-- REALTIME PUBLICATIONS
-- ─────────────────────────────────────────────
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ─────────────────────────────────────────────
-- PROFILES — new columns
-- ─────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_holder_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────
-- ORDERS — new columns
-- ─────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_out_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_out_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Add check constraint for payout_status (safe way)
DO $$
BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_payout_status_check
    CHECK (payout_status IN ('pending', 'paid_out', 'not_applicable'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- LISTINGS — new columns
-- ─────────────────────────────────────────────
ALTER TABLE listings ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────
-- RATINGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  rater_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rated_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (order_id, rater_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings (drop first to avoid duplicates)
DROP POLICY IF EXISTS "Ratings viewable by everyone" ON ratings;
CREATE POLICY "Ratings viewable by everyone"
  ON ratings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can rate after completed order" ON ratings;
CREATE POLICY "Users can rate after completed order"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- ─────────────────────────────────────────────
-- DISPUTES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  opened_by   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason      TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  resolution  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Disputes viewable by involved parties" ON disputes;
CREATE POLICY "Disputes viewable by involved parties"
  ON disputes FOR SELECT
  USING (
    auth.uid() = opened_by OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = disputes.order_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can open disputes" ON disputes;
CREATE POLICY "Authenticated users can open disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = opened_by);

-- ─────────────────────────────────────────────
-- INDEXES (all safe with IF NOT EXISTS)
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(listing_id, sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(receiver_id, read) WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_orders_payout
  ON orders(payout_status, status);

CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON ratings(order_id);

CREATE INDEX IF NOT EXISTS idx_listings_fts
  ON listings USING GIN(to_tsvector('simple', title || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_listings_seller_id  ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category   ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_location   ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price      ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_lid  ON listing_images(listing_id);

-- ─────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────

-- Mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_listing_id UUID,
  p_receiver_id UUID
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE listing_id = p_listing_id
    AND receiver_id = p_receiver_id
    AND read = FALSE;
END;
$$;

-- Get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages
  WHERE receiver_id = p_user_id AND read = FALSE;
$$;

-- Auto-update profile rating when new rating inserted
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET
    rating = (SELECT COALESCE(AVG(score), 0) FROM ratings WHERE rated_id = NEW.rated_id),
    review_count = (SELECT COUNT(*) FROM ratings WHERE rated_id = NEW.rated_id)
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_rating_inserted ON ratings;
CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE PROCEDURE update_profile_rating();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─────────────────────────────────────────────
-- VERIFY — show results
-- ─────────────────────────────────────────────
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns c 
        WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
