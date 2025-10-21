PRAGMA foreign_keys = ON;

-- table: company
CREATE TABLE IF NOT EXISTS company (
                                       company_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                                       name         TEXT NOT NULL,
                                       created_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                       updated_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- table: service
CREATE TABLE IF NOT EXISTS service (
                                       service_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                                       title        TEXT NOT NULL,
                                       created_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                       updated_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- table: company_service
CREATE TABLE IF NOT EXISTS company_service (
                                               company_service_id  INTEGER PRIMARY KEY AUTOINCREMENT,
                                               company_id          INTEGER NOT NULL,
                                               service_id          INTEGER NOT NULL,
                                               created_at          TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                               updated_at          TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                               FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
                                               FOREIGN KEY (service_id) REFERENCES service(service_id) ON DELETE CASCADE,
                                               UNIQUE (company_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_company_service_company ON company_service(company_id);
CREATE INDEX IF NOT EXISTS idx_company_service_service ON company_service(service_id);

-- table: user
CREATE TABLE IF NOT EXISTS "user" (
                                      user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
                                      name        TEXT NOT NULL,
                                      email       TEXT UNIQUE,
                                      role        TEXT DEFAULT 'customer',
                                      created_at  TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                      updated_at  TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- table: booking
CREATE TABLE IF NOT EXISTS booking (
                                       booking_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                                       user_id      INTEGER,
                                       description  TEXT,
                                       status       TEXT NOT NULL DEFAULT 'requested', -- requested/confirmed/cancelled/completed
                                       created_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                       updated_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                       FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_user ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);

-- table: booking_service
CREATE TABLE IF NOT EXISTS booking_service (
                                               booking_service_id  INTEGER PRIMARY KEY AUTOINCREMENT,
                                               booking_id          INTEGER NOT NULL,
                                               service_id          INTEGER NOT NULL,
                                               notes               TEXT,
                                               created_at          TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                               updated_at          TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                                               FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
                                               FOREIGN KEY (service_id) REFERENCES service(service_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_booking_service_booking ON booking_service(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_service_service ON booking_service(service_id);


-- ==========================================================
-- TRIGGERS: обновляют updated_at при любом UPDATE
-- ==========================================================

-- company
CREATE TRIGGER IF NOT EXISTS trg_company_updated
    AFTER UPDATE ON company
              FOR EACH ROW
BEGIN
UPDATE company SET updated_at = CURRENT_TIMESTAMP WHERE company_id = OLD.company_id;
END;

-- service
CREATE TRIGGER IF NOT EXISTS trg_service_updated
    AFTER UPDATE ON service
              FOR EACH ROW
BEGIN
UPDATE service SET updated_at = CURRENT_TIMESTAMP WHERE service_id = OLD.service_id;
END;

-- company_service
CREATE TRIGGER IF NOT EXISTS trg_company_service_updated
    AFTER UPDATE ON company_service
              FOR EACH ROW
BEGIN
UPDATE company_service SET updated_at = CURRENT_TIMESTAMP WHERE company_service_id = OLD.company_service_id;
END;

-- user
CREATE TRIGGER IF NOT EXISTS trg_user_updated
    AFTER UPDATE ON "user"
              FOR EACH ROW
BEGIN
UPDATE "user" SET updated_at = CURRENT_TIMESTAMP WHERE user_id = OLD.user_id;
END;

-- booking
CREATE TRIGGER IF NOT EXISTS trg_booking_updated
    AFTER UPDATE ON booking
              FOR EACH ROW
BEGIN
UPDATE booking SET updated_at = CURRENT_TIMESTAMP WHERE booking_id = OLD.booking_id;
END;

-- booking_service
CREATE TRIGGER IF NOT EXISTS trg_booking_service_updated
    AFTER UPDATE ON booking_service
              FOR EACH ROW
BEGIN
UPDATE booking_service SET updated_at = CURRENT_TIMESTAMP WHERE booking_service_id = OLD.booking_service_id;
END;
