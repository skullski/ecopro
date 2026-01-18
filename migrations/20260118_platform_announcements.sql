-- Global platform announcements (shown to logged-in users)

CREATE TABLE IF NOT EXISTS platform_announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  variant VARCHAR(20) NOT NULL DEFAULT 'blue', -- blue | red
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  min_view_ms INTEGER NOT NULL DEFAULT 0,
  allow_dismiss BOOLEAN NOT NULL DEFAULT TRUE,
  allow_never_show_again BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_admin_id BIGINT NULL REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_announcements_active
  ON platform_announcements (is_enabled, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS platform_announcement_preferences (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES platform_announcements(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL, -- client | staff | admin
  user_id BIGINT NOT NULL,
  never_show_again BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, user_type, user_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_announcement_prefs_lookup
  ON platform_announcement_preferences (announcement_id, user_type, user_id);
