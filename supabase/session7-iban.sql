-- =====================================================
-- Session 7 Migration — IBAN Payout System
-- Run in: Supabase Dashboard → SQL Editor
-- =====================================================

-- Add IBAN fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_holder_name TEXT;

-- Add payout tracking to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending'
    CHECK (payout_status IN ('pending', 'paid_out', 'not_applicable')),
  ADD COLUMN IF NOT EXISTS paid_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_out_note TEXT;

-- Index for admin payout queries
CREATE INDEX IF NOT EXISTS idx_orders_payout_status
  ON orders(payout_status, status);

-- Update RLS: allow users to update their own IBAN
CREATE POLICY IF NOT EXISTS "Users can update their IBAN"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- View for admin payout management
CREATE OR REPLACE VIEW pending_payouts AS
  SELECT
    o.id AS order_id,
    o.amount,
    o.platform_fee,
    o.amount - o.platform_fee AS seller_amount,
    o.status AS order_status,
    o.payout_status,
    o.created_at AS order_date,
    o.delivered_at,
    -- Seller info
    sp.id AS seller_id,
    sp.full_name AS seller_name,
    sp.iban AS seller_iban,
    sp.bank_name AS seller_bank,
    sp.bank_holder_name AS seller_bank_holder,
    -- Buyer info
    bp.full_name AS buyer_name,
    -- Listing info
    l.title AS listing_title
  FROM orders o
  LEFT JOIN profiles sp ON sp.id = o.seller_id
  LEFT JOIN profiles bp ON bp.id = o.buyer_id
  LEFT JOIN listings l ON l.id = o.listing_id
  WHERE o.status = 'delivered'
    AND o.payout_status = 'pending';
