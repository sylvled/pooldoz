-- PoolDoz initial schema
-- RLS enabled on all tables — user_id = auth.uid()

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Piscines
CREATE TABLE IF NOT EXISTS piscines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  plan_json JSONB NOT NULL DEFAULT '[]',
  zones_json JSONB NOT NULL DEFAULT '[]',
  volume DOUBLE PRECISION,
  cote_calibrage JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE piscines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "piscines_owner" ON piscines
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_piscines_user_id ON piscines(user_id);

-- Sessions (dosing history)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  piscine_id UUID NOT NULL REFERENCES piscines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produit TEXT NOT NULL,
  taux_mesure DOUBLE PRECISION,
  dose DOUBLE PRECISION,
  valide BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_owner" ON sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_sessions_piscine_id ON sessions(piscine_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
