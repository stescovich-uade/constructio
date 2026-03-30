export type NotificationAction = {
  type: "NAVIGATE";
  url: string;
};

export type NotificationTemplateInput = {
  type: string;
  data?: Record<string, any>;
  /** Used for server-built navigation targets (not persisted). */
  entityId?: string | null;
};

export type NotificationTemplateOutput = {
  title: string;
  body?: string;
  action?: NotificationAction;
};

function documentNavigateAction(entityId: string | null | undefined): NotificationAction | undefined {
  if (entityId === null || entityId === undefined || String(entityId).trim() === "") {
    return undefined;
  }
  return { type: "NAVIGATE", url: `/documents/${entityId}` };
}

/**
 * Centralized user-facing copy and actions per notification `type`.
 * Extend the switch when adding new workflow notifications.
 */
export function buildNotification(input: NotificationTemplateInput): NotificationTemplateOutput {
  const data = input.data ?? {};
  const entityId = input.entityId ?? null;

  switch (input.type) {
    case "DOCUMENT_APPROVED":
      return {
        title: "Document approved",
        body:
          typeof data.documentName === "string" && data.documentName.length > 0
            ? `${data.documentName} has been approved.`
            : undefined,
        action: documentNavigateAction(entityId),
      };

    case "DOCUMENT_SUBMITTED":
      return {
        title: "Document submitted",
        body: "A new version has been submitted for review.",
        action: documentNavigateAction(entityId),
      };

    case "DOCUMENT_REJECTED":
      return {
        title: "Document rejected",
        body: "A document version you are involved with was rejected.",
        action: documentNavigateAction(entityId),
      };

    case "DOCUMENT_ASSIGNED":
    case "REVIEW_ASSIGNED":
      return {
        title: "Review assigned",
        body: "You have been assigned to review a document version.",
        action: documentNavigateAction(entityId),
      };

    default:
      throw new Error(`Unknown notification type: ${input.type}`);
  }
}

/** Action for API responses; unknown types yield no action (no throw). */
export function notificationTemplateAction(
  input: Pick<NotificationTemplateInput, "type" | "entityId">,
): NotificationAction | undefined {
  try {
    return buildNotification({ type: input.type, entityId: input.entityId, data: {} }).action;
  } catch {
    return undefined;
  }
}
