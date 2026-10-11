-- ============================================================
-- Sakan DZ - Supabase/PostgreSQL Schema
-- Algerian Real Estate Platform
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Properties Table
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT NOT NULL,
  description_ar TEXT,

  operation_type TEXT NOT NULL CHECK (operation_type IN ('rent', 'sale', 'vacation', 'colocation')),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'villa', 'studio', 'commercial', 'land')),

  price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DZD' CHECK (currency IN ('DZD', 'EUR', 'USD')),
  price_per_night NUMERIC(15, 2),

  wilaya_id INTEGER NOT NULL CHECK (wilaya_id BETWEEN 1 AND 58),
  daira TEXT,
  commune TEXT,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED,

  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area NUMERIC(10, 2) NOT NULL,
  floor INTEGER,

  legal_status TEXT NOT NULL CHECK (legal_status IN ('acte_notaire', 'livret_foncier', 'decision', 'papier_timbre')),

  images TEXT[] NOT NULL DEFAULT '{}',

  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,

  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INTEGER NOT NULL DEFAULT 0,

  -- Module 2: Essential commodities
  water_availability TEXT NOT NULL DEFAULT '24_7' CHECK (water_availability IN ('24_7', 'tank_bache', 'schedule', 'intermittent')),
  gas_type TEXT NOT NULL DEFAULT 'city_gas' CHECK (gas_type IN ('city_gas', 'butane_bottles', 'none')),
  electricity_meter TEXT NOT NULL DEFAULT 'individual' CHECK (electricity_meter IN ('individual', 'shared', 'commercial')),
  has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
  floor_number INTEGER,
  building_floors INTEGER,

  -- Module 4: Colocation
  colocation_gender TEXT CHECK (colocation_gender IN ('male_only', 'female_only', 'any')),
  student_friendly BOOLEAN NOT NULL DEFAULT FALSE,
  roommates_count INTEGER,
  available_beds INTEGER,
  smoking_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  wifi_included BOOLEAN NOT NULL DEFAULT TRUE,

  -- Module 5: Vacation
  cleaning_fee NUMERIC(10, 2),
  booked_dates TEXT[] DEFAULT '{}',

  -- Module 7: Agency
  agency_id UUID,
  agency_name TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_operation_type ON properties(operation_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_wilaya_id ON properties(wilaya_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON properties(is_verified);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_agency_id ON properties(agency_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ============================================================
-- Conversations Table
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON conversations(property_id);

-- ============================================================
-- Messages Table
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================
-- Favorites Table
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- ============================================================
-- Saved Searches Table
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL DEFAULT '{}',
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- ============================================================
-- Push Subscriptions Table (Web Push fan-out targets)
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL DEFAULT '',
  auth TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (is_available = TRUE);

CREATE POLICY "Owners can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = owner_id);

-- Conversations Policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants can delete conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

CREATE POLICY "Participants can update messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Favorites Policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Searches Policies
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Push Subscriptions Policies (users manage only their own endpoints)
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Functions & Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION increment_property_views(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties SET views_count = views_count + 1 WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_property_views(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      unread_count = unread_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================
-- Profiles Table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'agency')),
  agency_name TEXT,
  wilaya_id INTEGER NOT NULL DEFAULT 16,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_wilaya_id ON profiles(wilaya_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, user_type, agency_name, wilaya_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
    NEW.raw_user_meta_data->>'agency_name',
    COALESCE((NEW.raw_user_meta_data->>'wilaya_id')::integer, 16)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS Policies for Profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile or agency profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR user_type = 'agency');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- Storage Bucket for Property Images
-- ============================================================

CREATE POLICY "Property images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Migration: role-based onboarding (buyer/seller UI mode)
-- Run once in production. The app also works without this column
-- by falling back to per-user localStorage persistence.
-- ============================================================

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('buyer', 'seller'));

-- Personal Darna Duo invite code: a partner entering this code is linked to
-- the owner's shared favorites group (see joinGroupByCode).
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS invite_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_invite_code
  ON profiles(invite_code)
  WHERE invite_code IS NOT NULL;

-- ============================================================
-- Collaborative Favorites ("مفضلة العائلة والشريك")
-- Two-member shared favorites: invite-code groups, member reactions,
-- notes and visit statuses on shared properties.
-- ============================================================

CREATE TABLE IF NOT EXISTS shared_favorite_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared_favorite_members (
  group_id UUID NOT NULL REFERENCES shared_favorite_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS shared_favorite_items (
  group_id UUID NOT NULL REFERENCES shared_favorite_groups(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL DEFAULT '',
  reaction TEXT CHECK (reaction IN ('love', 'happy', 'thinking', 'skeptical', 'sad')),
  reaction_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_status TEXT NOT NULL DEFAULT 'none'
    CHECK (visit_status IN ('none', 'to_contact', 'to_visit', 'visited')),
  visit_at TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_shared_members_user ON shared_favorite_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_group ON shared_favorite_items(group_id);

ALTER TABLE shared_favorite_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_favorite_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_favorite_items ENABLE ROW LEVEL SECURITY;

-- Helper avoids RLS recursion: a policy on shared_favorite_members cannot
-- SELECT from shared_favorite_members itself (Postgres raises "infinite
-- recursion detected in policy"). SECURITY DEFINER evaluates the membership
-- check outside RLS so the group / member / item policies can share it safely.
CREATE OR REPLACE FUNCTION public.is_shared_group_member(gid uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shared_favorite_members
    WHERE group_id = gid AND user_id = uid
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_shared_group_member(uuid, uuid) TO authenticated;

-- Members can view their own groups, memberships and shared items.
DROP POLICY IF EXISTS "Members can view own shared groups" ON shared_favorite_groups;
CREATE POLICY "Members can view own shared groups"
  ON shared_favorite_groups FOR SELECT
  USING (public.is_shared_group_member(id, auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create shared groups" ON shared_favorite_groups;
CREATE POLICY "Authenticated users can create shared groups"
  ON shared_favorite_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Members can view group memberships" ON shared_favorite_members;
CREATE POLICY "Members can view group memberships"
  ON shared_favorite_members FOR SELECT
  USING (public.is_shared_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Users can join shared groups" ON shared_favorite_members;
CREATE POLICY "Users can join shared groups"
  ON shared_favorite_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can view shared items" ON shared_favorite_items;
CREATE POLICY "Members can view shared items"
  ON shared_favorite_items FOR SELECT
  USING (public.is_shared_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members can manage shared items" ON shared_favorite_items;
CREATE POLICY "Members can manage shared items"
  ON shared_favorite_items FOR ALL
  USING (public.is_shared_group_member(group_id, auth.uid()))
  WITH CHECK (public.is_shared_group_member(group_id, auth.uid()));

CREATE POLICY "Members can leave shared groups"
  ON shared_favorite_members FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Darna Duo join RPC. Client-side lookups of `shared_favorite_groups`
-- and `profiles` by invite code are blocked by RLS for strangers
-- (group rows are member-visible only; profiles are self/agency-visible
-- only), so joining must happen server-side. SECURITY DEFINER evaluates
-- outside RLS, following the is_shared_group_member pattern above.
-- Errors: SELF_CODE (own personal code), INVALID_CODE (unknown code).
-- Member rows omit display_name so the RPC also works on older tables.
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_or_create_duo_group(partner_invite_code TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean TEXT := upper(trim(partner_invite_code));
  me uuid := auth.uid();
  partner uuid;
  gid uuid;
  new_code TEXT;
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  IF clean IS NULL OR clean = '' THEN
    RAISE EXCEPTION 'INVALID_CODE';
  END IF;

  -- 1) Direct group invite code.
  SELECT id INTO gid FROM shared_favorite_groups WHERE invite_code = clean;
  IF gid IS NOT NULL THEN
    INSERT INTO shared_favorite_members (group_id, user_id)
    VALUES (gid, me)
    ON CONFLICT (group_id, user_id) DO NOTHING;
    RETURN gid;
  END IF;

  -- 2) Personal profile invite code -> link the two accounts.
  SELECT id INTO partner FROM profiles WHERE invite_code = clean;
  IF partner IS NULL THEN
    RAISE EXCEPTION 'INVALID_CODE';
  END IF;
  IF partner = me THEN
    RAISE EXCEPTION 'SELF_CODE';
  END IF;

  -- Reuse the partner's latest group, or create one for both accounts.
  SELECT group_id INTO gid
  FROM shared_favorite_members
  WHERE user_id = partner
  ORDER BY joined_at DESC
  LIMIT 1;

  IF gid IS NULL THEN
    LOOP
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(alphabet, (floor(random() * 32) + 1)::int, 1);
      END LOOP;
      BEGIN
        gid := gen_random_uuid();
        INSERT INTO shared_favorite_groups (id, created_by, invite_code)
        VALUES (gid, partner, new_code);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        gid := NULL;
      END;
    END LOOP;
    INSERT INTO shared_favorite_members (group_id, user_id)
    VALUES (gid, partner)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;

  INSERT INTO shared_favorite_members (group_id, user_id)
  VALUES (gid, me)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN gid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_or_create_duo_group(TEXT) TO authenticated;

-- ============================================================
-- Structured Darna Duo join RPC. Same server-side join as above but
-- with a JSON contract {success, code, message, group_id} so the client
-- can surface the exact failure reason. Client-side lookups of groups /
-- profiles by invite code are RLS-blocked for strangers, hence server-side.
-- Codes: SELF_CODE (own personal code), INVALID_CODE (unknown code).
-- Member rows omit display_name so the RPC also works on older tables.
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_and_join_duo(invite_code_input TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean TEXT := upper(trim(invite_code_input));
  me uuid := auth.uid();
  partner uuid;
  gid uuid;
  new_code TEXT;
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
BEGIN
  IF me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHENTICATED', 'message', 'Not authenticated.', 'group_id', NULL);
  END IF;
  IF clean IS NULL OR clean = '' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CODE', 'message', 'Invite code not found or invalid.', 'group_id', NULL);
  END IF;

  -- 1) Direct group invite code.
  SELECT id INTO gid FROM shared_favorite_groups WHERE invite_code = clean;
  IF gid IS NOT NULL THEN
    INSERT INTO shared_favorite_members (group_id, user_id)
    VALUES (gid, me)
    ON CONFLICT (group_id, user_id) DO NOTHING;
    RETURN jsonb_build_object('success', true, 'code', 'JOINED', 'message', 'Accounts linked successfully.', 'group_id', gid);
  END IF;

  -- 2) Personal profile invite code -> link the two accounts.
  SELECT id INTO partner FROM profiles WHERE invite_code = clean;
  IF partner IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CODE', 'message', 'Invite code not found or invalid.', 'group_id', NULL);
  END IF;
  IF partner = me THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF_CODE', 'message', 'You cannot use your own invite code.', 'group_id', NULL);
  END IF;

  -- Reuse the partner's latest group, or create one for both accounts.
  SELECT group_id INTO gid
  FROM shared_favorite_members
  WHERE user_id = partner
  ORDER BY joined_at DESC
  LIMIT 1;

  IF gid IS NULL THEN
    LOOP
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(alphabet, (floor(random() * 32) + 1)::int, 1);
      END LOOP;
      BEGIN
        gid := gen_random_uuid();
        INSERT INTO shared_favorite_groups (id, created_by, invite_code)
        VALUES (gid, partner, new_code);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        gid := NULL;
      END;
    END LOOP;
    INSERT INTO shared_favorite_members (group_id, user_id)
    VALUES (gid, partner)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;

  INSERT INTO shared_favorite_members (group_id, user_id)
  VALUES (gid, me)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN jsonb_build_object('success', true, 'code', 'JOINED', 'message', 'Accounts linked successfully.', 'group_id', gid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_and_join_duo(TEXT) TO authenticated;

-- Single source of truth: the legacy uuid-returning RPC now delegates.
CREATE OR REPLACE FUNCTION public.join_or_create_duo_group(partner_invite_code TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
BEGIN
  r := public.validate_and_join_duo(partner_invite_code);
  IF NOT COALESCE((r->>'success')::boolean, false) THEN
    RAISE EXCEPTION '%', COALESCE(r->>'code', 'INVALID_CODE');
  END IF;
  RETURN (r->>'group_id')::uuid;
END;
$$;
