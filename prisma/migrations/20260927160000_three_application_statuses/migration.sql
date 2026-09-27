-- Trois statuts seulement (décision du 2026-09-27) : Brouillon, Acceptée et Classée disparaissent.
-- Conversion : Brouillon → Postulée, Classée → Postulée, Acceptée → Entretien.

UPDATE "Application" SET "status" = 'APPLIED' WHERE "status" IN ('DRAFT', 'ARCHIVED');
UPDATE "Application" SET "status" = 'INTERVIEW' WHERE "status" = 'ACCEPTED';

UPDATE "ApplicationStatusChange" SET "fromStatus" = 'APPLIED' WHERE "fromStatus" IN ('DRAFT', 'ARCHIVED');
UPDATE "ApplicationStatusChange" SET "fromStatus" = 'INTERVIEW' WHERE "fromStatus" = 'ACCEPTED';
UPDATE "ApplicationStatusChange" SET "toStatus" = 'APPLIED' WHERE "toStatus" IN ('DRAFT', 'ARCHIVED');
UPDATE "ApplicationStatusChange" SET "toStatus" = 'INTERVIEW' WHERE "toStatus" = 'ACCEPTED';

-- Un changement devenu « Postulée → Postulée » (ex. ancien Brouillon → Postulée) n'en est plus un.
DELETE FROM "ApplicationStatusChange" WHERE "fromStatus" = "toStatus";

-- PostgreSQL ne sait pas retirer une valeur d'enum : on crée le nouveau type et on bascule les colonnes.
CREATE TYPE "ApplicationStatus_new" AS ENUM ('APPLIED', 'INTERVIEW', 'REJECTED');
ALTER TABLE "Application"
  ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TABLE "ApplicationStatusChange"
  ALTER COLUMN "fromStatus" TYPE "ApplicationStatus_new" USING ("fromStatus"::text::"ApplicationStatus_new"),
  ALTER COLUMN "toStatus" TYPE "ApplicationStatus_new" USING ("toStatus"::text::"ApplicationStatus_new");
DROP TYPE "ApplicationStatus";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
