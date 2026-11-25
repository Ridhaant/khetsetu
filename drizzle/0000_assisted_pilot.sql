CREATE TABLE pilot_requests (
  id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  idempotency_hash TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  receipt_hash TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('buyer', 'farmer')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  pin TEXT NOT NULL,
  produce TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  grade TEXT NOT NULL,
  needed_by TEXT NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  customer_update TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  selected_quote_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX pilot_requests_created ON pilot_requests (created_at);
--> statement-breakpoint
CREATE TABLE pilot_quotes (
  id TEXT PRIMARY KEY NOT NULL,
  request_id TEXT NOT NULL REFERENCES pilot_requests(id),
  supplier_name TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise > 0),
  delivery_paise INTEGER NOT NULL CHECK (delivery_paise >= 0),
  packing_paise INTEGER NOT NULL CHECK (packing_paise >= 0),
  fee_paise INTEGER NOT NULL CHECK (fee_paise >= 0),
  total_paise INTEGER NOT NULL CHECK (total_paise > 0),
  grade TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX pilot_quotes_request ON pilot_quotes (request_id);
--> statement-breakpoint
CREATE TABLE pilot_audit (
  id TEXT PRIMARY KEY NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  request_id TEXT NOT NULL REFERENCES pilot_requests(id),
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE pilot_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  window INTEGER NOT NULL,
  count INTEGER NOT NULL
);
