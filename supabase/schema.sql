-- ============================================================
-- Agora.cy — Full Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  location      TEXT,
  bio           TEXT,
  rating        NUMERIC(3,2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  verified      BOOLEAN DEFAULT FALSE,
  stripe_account_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─────────────────────────────────────────────
-- LISTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  category    TEXT NOT NULL,
  condition   TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  location    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'deleted')),
  views       INTEGER DEFAULT 0,
  promoted    BOOLEAN DEFAULT FALSE,
  promoted_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- LISTING IMAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  position    INTEGER DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID REFERENCES listings(id) NOT NULL,
  buyer_id              UUID REFERENCES profiles(id) NOT NULL,
  seller_id             UUID REFERENCES profiles(id) NOT NULL,
  amount                NUMERIC(10,2) NOT NULL,
  platform_fee          NUMERIC(10,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'delivered', 'completed', 'disputed', 'refunded', 'canceled')),
  stripe_payment_intent TEXT,
  delivery_type         TEXT DEFAULT 'meetup' CHECK (delivery_type IN ('meetup', 'shipping')),
  confirmed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  -- Direct messages (pre-order) use listing_id + participants
  listing_id  UUID REFERENCES listings(id) ON DELETE SET NULL,
  sender_id   UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- RATINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) NOT NULL,
  rater_id    UUID REFERENCES profiles(id) NOT NULL,
  rated_id    UUID REFERENCES profiles(id) NOT NULL,
  score       INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (order_id, rater_id)
);

-- Auto-update profile rating when new rating is inserted
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    rating = (SELECT ROUND(AVG(score)::NUMERIC, 2) FROM ratings WHERE rated_id = NEW.rated_id),
    review_count = (SELECT COUNT(*) FROM ratings WHERE rated_id = NEW.rated_id)
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_rating_inserted ON ratings;
CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE PROCEDURE update_profile_rating();

-- ─────────────────────────────────────────────
-- WISHLISTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

-- Full-text search index on listings
CREATE INDEX IF NOT EXISTS idx_listings_fts ON listings
  USING GIN(to_tsvector('simple', title || ' ' || COALESCE(description, '')));

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- LISTINGS policies
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status != 'deleted');

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
  ON listings FOR DELETE USING (auth.uid() = seller_id);

-- LISTING IMAGES policies
CREATE POLICY "Listing images are viewable by everyone"
  ON listing_images FOR SELECT USING (TRUE);

CREATE POLICY "Sellers can manage their listing images"
  ON listing_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.seller_id = auth.uid()
    )
  );

-- ORDERS policies
CREATE POLICY "Orders viewable by buyer or seller"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyer or seller can update order"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- MESSAGES policies
CREATE POLICY "Messages viewable by sender or receiver"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RATINGS policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT USING (TRUE);

CREATE POLICY "Users can rate after completed order"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = ratings.order_id
        AND orders.status = 'completed'
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- WISHLISTS policies
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their wishlist"
  ON wishlists FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- STORAGE — create listing-images bucket
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  TRUE,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Listing images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );
