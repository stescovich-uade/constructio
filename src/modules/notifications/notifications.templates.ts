export type NotificationTemplateInput = {
  type: string;
  data?: Record<string, any>;
};

export type NotificationTemplateOutput = {
  title: string;
  body?: string;
};

/**
 * Centralized user-facing copy per notification `type`.
 * Extend the switch when adding new workflow notifications.
 */
export function buildNotification(input: NotificationTemplateInput): NotificationTemplateOutput {
  const data = input.data ?? {};

  switch (input.type) {
    case "DOCUMENT_APPROVED":
      return {
        title: "Document approved",
        body:
          typeof data.documentName === "string" && data.documentName.length > 0
            ? `${data.documentName} has been approved.`
            : undefined,
      };

    case "DOCUMENT_SUBMITTED":
      return {
        title: "Document submitted",
        body: "A new version has been submitted for review.",
      };

    case "DOCUMENT_REJECTED":
      return {
        title: "Document rejected",
        body: "A document version you are involved with was rejected.",
      };

    case "DOCUMENT_ASSIGNED":
    case "REVIEW_ASSIGNED":
      return {
        title: "Review assigned",
        body: "You have been assigned to review a document version.",
      };

    default:
      throw new Error(`Unknown notification type: ${input.type}`);
  }
}
