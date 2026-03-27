-- Rename version status enum to DocumentStatus and extend workflow values
ALTER TYPE "VersionStatus" RENAME TO "DocumentStatus";

ALTER TYPE "DocumentStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "DocumentStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "DocumentStatus" ADD VALUE 'REJECTED';

-- Review assignments for approval workflow
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentVersionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_documentVersionId_reviewerId_key" ON "Review"("documentVersionId", "reviewerId");
CREATE INDEX "Review_documentVersionId_idx" ON "Review"("documentVersionId");
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- APTO only when every review is APPROVED (and at least one review exists)
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
  v_version_status TEXT;
BEGIN
  SELECT dv."documentId", dv."threadId", t."projectId", dv.status::text
  INTO v_document_id, v_thread_id, v_project_id, v_version_status
  FROM "DocumentVersion" dv
  JOIN "Thread" t ON t.id = dv."threadId"
  WHERE dv.id = p_version_id;

  IF v_document_id IS NULL THEN
    RAISE EXCEPTION 'DocumentVersion not found';
  END IF;

  IF v_version_status IS DISTINCT FROM 'UNDER_REVIEW' THEN
    RAISE EXCEPTION 'Can only promote to APTO from UNDER_REVIEW';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Review" r WHERE r."documentVersionId" = p_version_id
  ) THEN
    RAISE EXCEPTION 'Cannot promote to APTO: no reviews assigned';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "Review" r
    WHERE r."documentVersionId" = p_version_id
      AND r.status IS DISTINCT FROM 'APPROVED'
  ) THEN
    RAISE EXCEPTION 'Cannot promote to APTO: not all reviews approved';
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

-- Block changing fileUrl once the version is no longer DRAFT (SUBMITTED+)
CREATE OR REPLACE FUNCTION enforce_draft_only_fileurl_edit()
RETURNS trigger AS $$
BEGIN
  IF OLD.status::text IS DISTINCT FROM 'DRAFT' THEN
    IF NEW."fileUrl" IS DISTINCT FROM OLD."fileUrl" THEN
      RAISE EXCEPTION 'DocumentVersion fileUrl cannot change after submission';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_draft_only_fileurl_edit
BEFORE UPDATE ON "DocumentVersion"
FOR EACH ROW
EXECUTE FUNCTION enforce_draft_only_fileurl_edit();
