ALTER TABLE repos ADD COLUMN is_stellar boolean DEFAULT false NOT NULL;

ALTER TABLE repos ADD COLUMN stack text[] DEFAULT '{}' NOT NULL;

ALTER TABLE repos ADD COLUMN stellar_libs text[] DEFAULT '{}' NOT NULL;

ALTER TABLE repos ADD COLUMN ecosystem_scanned_at timestamptz;
