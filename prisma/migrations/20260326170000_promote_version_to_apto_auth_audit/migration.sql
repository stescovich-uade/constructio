-- Replace single-arg overload with user-scoped promotion + DB authorization + audit row.

DROP FUNCTION IF EXISTS promote_version_to_apto(TEXT);

CREATE OR REPLACE FUNCTION promote_version_to_apto(
  p_version_id TEXT,
  p_user_id TEXT
)
RETURNS VOID AS $$
DECLARE
  v_document_id TEXT;
  v_thread_id TEXT;
  v_project_id TEXT;
  v_company_id TEXT;
BEGIN
  SELECT dv."documentId", dv."threadId", t."projectId"
  INTO v_document_id, v_thread_id, v_project_id
  FROM "DocumentVersion" dv
  JOIN "Thread" t ON t.id = dv."threadId"
  WHERE dv.id = p_version_id;

  IF v_document_id IS NULL THEN
    RAISE EXCEPTION 'DocumentVersion not found';
  END IF;

  SELECT "companyId" INTO v_company_id
  FROM "User"
  WHERE id = p_user_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "ProjectCompany"
    WHERE "projectId" = v_project_id
      AND "companyId" = v_company_id
  ) THEN
    RAISE EXCEPTION 'User not authorized for this project';
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

  INSERT INTO "AuditLog" (
    id,
    "createdAt",
    "updatedAt",
    "userId",
    action,
    "entityType",
    "entityId",
    metadata
  ) VALUES (
    gen_random_uuid()::text,
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3),
    p_user_id,
    'DOCUMENT_VERSION_PROMOTED_TO_APTO',
    'DocumentVersion',
    p_version_id,
    jsonb_build_object(
      'projectId', v_project_id,
      'threadId', v_thread_id,
      'documentId', v_document_id
    )
  );
END;
$$ LANGUAGE plpgsql;
