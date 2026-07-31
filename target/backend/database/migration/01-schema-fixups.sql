-- Schema fix-ups applied on top of the TypeORM-synchronized schema.
-- Run this AFTER the backend has created the tables (first boot with
-- TYPEORM_SYNCHRONIZE=true), and BEFORE the seed scripts.

USE lamtek_db;

-- The legacy `nama` column on `users` is NOT NULL with no default in the
-- synchronized schema, which breaks registration (the entity only writes `name`).
-- Give it a default so inserts that omit it succeed.
ALTER TABLE users MODIFY COLUMN nama varchar(255) NULL DEFAULT '';
