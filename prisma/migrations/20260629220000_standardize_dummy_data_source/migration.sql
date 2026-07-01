-- Migration: Standardize data_source enum from 'SIMULATED' to 'DUMMY'
--
-- The PRD consistently uses "Dummy Data" / "Dummy Injector" terminology.
-- This migration safely converts any existing DailySales records with
-- data_source = 'SIMULATED' to data_source = 'DUMMY' without data loss.
--
-- This is a one-time data migration. No schema changes are needed because
-- data_source is a free-text string column (default: 'REAL').

UPDATE "DailySales"
SET "data_source" = 'DUMMY'
WHERE "data_source" = 'SIMULATED';
