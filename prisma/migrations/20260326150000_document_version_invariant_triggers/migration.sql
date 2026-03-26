-- Database-level guards on DocumentVersion (do not modify prior thread-consistency trigger or partial unique indexes)

CREATE OR REPLACE FUNCTION enforce_apto_requires_current()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'APTO' AND NEW."isCurrent" = false THEN
    RAISE EXCEPTION 'APTO version must be current';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apto_requires_current
BEFORE INSERT OR UPDATE ON "DocumentVersion"
FOR EACH ROW
EXECUTE FUNCTION enforce_apto_requires_current();

CREATE OR REPLACE FUNCTION enforce_single_current()
RETURNS trigger AS $$
BEGIN
  IF NEW."isCurrent" = true THEN
    UPDATE "DocumentVersion"
    SET "isCurrent" = false
    WHERE "documentId" = NEW."documentId"
      AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_current
BEFORE INSERT OR UPDATE ON "DocumentVersion"
FOR EACH ROW
WHEN (NEW."isCurrent" = true)
EXECUTE FUNCTION enforce_single_current();

CREATE OR REPLACE FUNCTION enforce_apto_version_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'APTO' AND NEW."versionNumber" IS NULL THEN
    RAISE EXCEPTION 'APTO version must have versionNumber';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apto_version_number
BEFORE INSERT OR UPDATE ON "DocumentVersion"
FOR EACH ROW
EXECUTE FUNCTION enforce_apto_version_number();
