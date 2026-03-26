-- Centralized APTO transition (single source of truth). Existing triggers remain as guards.

CREATE OR REPLACE FUNCTION promote_version_to_apto(p_version_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_document_id TEXT;
  v_thread_id TEXT;
BEGIN
  SELECT "documentId", "threadId"
  INTO v_document_id, v_thread_id
  FROM "DocumentVersion"
  WHERE id = p_version_id;

  IF v_document_id IS NULL THEN
    RAISE EXCEPTION 'DocumentVersion not found';
  END IF;

  UPDATE "DocumentVersion"
  SET status = 'SUPERSEDED', "isCurrent" = false
  WHERE "threadId" = v_thread_id
    AND status = 'APTO'
    AND id <> p_version_id;

  UPDATE "DocumentVersion"
  SET "isCurrent" = false
  WHERE "documentId" = v_document_id
    AND id <> p_version_id;

  UPDATE "DocumentVersion"
  SET status = 'APTO', "isCurrent" = true
  WHERE id = p_version_id;
END;
$$ LANGUAGE plpgsql;
