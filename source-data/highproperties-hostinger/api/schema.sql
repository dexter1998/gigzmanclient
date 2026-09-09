-- High Properties — MySQL schema (Hostinger: hPanel → Databases → phpMyAdmin → Import)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS listings (
  id          VARCHAR(32)  NOT NULL PRIMARY KEY,
  slug        VARCHAR(180) NOT NULL DEFAULT '',
  title       VARCHAR(200) NOT NULL,
  type        VARCHAR(80)  NOT NULL DEFAULT '',
  category    VARCHAR(32)  NOT NULL DEFAULT 'residential',
  purpose     VARCHAR(160) NOT NULL DEFAULT '["buy"]',
  price       BIGINT       NULL,
  priceLabel  VARCHAR(60)  NOT NULL DEFAULT '',
  city        VARCHAR(80)  NOT NULL DEFAULT 'Gurugram',
  sector      VARCHAR(80)  NOT NULL DEFAULT '',
  locality    VARCHAR(120) NOT NULL DEFAULT '',
  location    VARCHAR(240) NOT NULL DEFAULT '',
  beds        INT          NULL,
  baths       INT          NULL,
  area        DECIMAL(12,2) NULL,
  areaUnit    VARCHAR(16)  NOT NULL DEFAULT 'sq.ft',
  status      VARCHAR(60)  NOT NULL DEFAULT '',
  badge       VARCHAR(60)  NOT NULL DEFAULT '',
  featured    TINYINT(1)   NOT NULL DEFAULT 0,
  icon        VARCHAR(16)  NOT NULL DEFAULT '',
  gradient    VARCHAR(200) NOT NULL DEFAULT '',
  specs       TEXT         NULL,
  amenities   TEXT         NULL,
  description TEXT         NULL,
  rera        VARCHAR(80)  NOT NULL DEFAULT '',
  postedOn    DATE         NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_active_featured (active, featured),
  KEY idx_category (category),
  KEY idx_price (price),
  KEY idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id            VARCHAR(32)  NOT NULL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL DEFAULT '',
  phone         VARCHAR(20)  NOT NULL DEFAULT '',
  email         VARCHAR(190) NOT NULL DEFAULT '',
  role          VARCHAR(60)  NOT NULL DEFAULT '',
  property_type VARCHAR(120) NOT NULL DEFAULT '',
  budget        VARCHAR(60)  NOT NULL DEFAULT '',
  location      VARCHAR(160) NOT NULL DEFAULT '',
  message       TEXT         NULL,
  source        VARCHAR(80)  NOT NULL DEFAULT 'website',
  stage         VARCHAR(32)  NOT NULL DEFAULT 'new',
  ip            VARCHAR(45)  NOT NULL DEFAULT '',
  created_at    DATETIME     NOT NULL,
  KEY idx_created (created_at),
  KEY idx_stage (stage),
  KEY idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wa_conversations (
  id         VARCHAR(64)  NOT NULL PRIMARY KEY,
  direction  VARCHAR(10)  NOT NULL DEFAULT 'in',
  wa_id      VARCHAR(20)  NOT NULL DEFAULT '',
  name       VARCHAR(150) NOT NULL DEFAULT '',
  text       TEXT         NULL,
  type       VARCHAR(30)  NOT NULL DEFAULT 'text',
  created_at DATETIME     NOT NULL,
  KEY idx_wa (wa_id),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
