-- Composite index for thread-scoped document lookups by type
CREATE INDEX "Document_threadId_type_idx" ON "Document"("threadId", "type");

CREATE OR REPLACE FUNCTION enforce_thread_consistency()
RETURNS trigger AS $$
DECLARE
  doc_thread_id TEXT;
BEGIN
  SELECT "threadId" INTO doc_thread_id FROM "Document" WHERE id = NEW."documentId";
  IF doc_thread_id IS NULL THEN
    RAISE EXCEPTION 'Document not found for DocumentVersion';
  END IF;
  IF NEW."threadId" IS DISTINCT FROM doc_thread_id THEN
    RAISE EXCEPTION 'Thread mismatch between Document and DocumentVersion';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_version_thread_check
BEFORE INSERT OR UPDATE ON "DocumentVersion"
FOR EACH ROW
EXECUTE FUNCTION enforce_thread_consistency();
