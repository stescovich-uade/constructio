-- Stricter lock after submission: immutable identity/content fields + workflow-only status transitions

DROP TRIGGER IF EXISTS trg_draft_only_fileurl_edit ON "DocumentVersion";
DROP FUNCTION IF EXISTS enforce_draft_only_fileurl_edit();

CREATE OR REPLACE FUNCTION enforce_document_version_locked_after_submission()
RETURNS trigger AS $$
BEGIN
  IF OLD.status::text = 'DRAFT' THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt"
     OR NEW."fileUrl" IS DISTINCT FROM OLD."fileUrl"
     OR NEW."versionNumber" IS DISTINCT FROM OLD."versionNumber"
     OR NEW."documentId" IS DISTINCT FROM OLD."documentId"
     OR NEW."threadId" IS DISTINCT FROM OLD."threadId" THEN
    RAISE EXCEPTION 'DocumentVersion locked after submission';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status::text = 'SUBMITTED' AND NEW.status::text = 'UNDER_REVIEW')
      OR (OLD.status::text = 'UNDER_REVIEW' AND NEW.status::text = 'REJECTED')
      OR (OLD.status::text = 'UNDER_REVIEW' AND NEW.status::text = 'APTO')
      OR (OLD.status::text = 'APTO' AND NEW.status::text = 'SUPERSEDED')
    ) THEN
      RAISE EXCEPTION 'DocumentVersion locked after submission';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_version_locked_after_submission
BEFORE UPDATE ON "DocumentVersion"
FOR EACH ROW
EXECUTE FUNCTION enforce_document_version_locked_after_submission();
