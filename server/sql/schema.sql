CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  firebase_uid TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;

ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL DEFAULT '',
  color TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'note';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS color TEXT;

CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  UNIQUE (note_id, tag)
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Unificar tablas de items (esquema Neon init vs schema local)
DROP TABLE IF EXISTS checklist_items CASCADE;
ALTER TABLE IF EXISTS note_items RENAME TO checklist_items;

CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]',
  color TEXT NOT NULL DEFAULT '#6366F1',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alinear note_id con notes.id (UUID en Neon)
ALTER TABLE note_attachments DROP CONSTRAINT IF EXISTS note_attachments_note_id_fkey;
ALTER TABLE note_attachments ALTER COLUMN note_id TYPE UUID USING note_id::uuid;
ALTER TABLE note_attachments ADD CONSTRAINT note_attachments_note_id_fkey FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE;
