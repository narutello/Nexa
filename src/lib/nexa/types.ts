export const ROLES = ["USER", "ADMIN", "OWNER"] as const;
export type Role = (typeof ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "warned", "suspended", "banned"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const REPORT_STATUSES = ["pending", "reviewing", "resolved", "rejected"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_TARGETS = ["user", "conversation", "message"] as const;
export type ReportTargetType = (typeof REPORT_TARGETS)[number];

export const REPORT_REASONS = [
  "harassment",
  "hate",
  "threats",
  "spam",
  "scam",
  "sexual",
  "impersonation",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Harassment or bullying",
  hate: "Hate or slurs",
  threats: "Threats or violence",
  spam: "Spam",
  scam: "Scam or fraud",
  sexual: "Sexual content",
  impersonation: "Impersonation",
  other: "Something else",
};

export const MESSAGE_MAX_LENGTH = 4000;
export const DETAILS_MAX_LENGTH = 2000;
export const DISPLAY_NAME_MAX = 40;
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 24;
export const SEARCH_MIN = 2;
export const SEARCH_LIMIT = 20;
export const INBOX_PAGE = 30;
export const MESSAGE_PAGE = 30;
export const EVIDENCE_MAX = 5;
export const EVIDENCE_CONTEXT = 1;
export const PRESENCE_TTL_MS = 45_000;
export const TYPING_TTL_MS = 4_000;
export const ONLINE_WINDOW_MS = 45_000;

export type PublicProfile = {
  userId: string;
  displayName: string;
  handle: string;
  avatarHue: number;
  online: boolean;
  lastSeenAt: string | null;
};

export type MyProfile = PublicProfile & {
  role: Role;
  status: AccountStatus;
  statusReason: string | null;
  email: string | null;
};

export type ConversationPreview = {
  id: string;
  other: PublicProfile;
  lastMessage: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
  } | null;
  lastMessageAt: string;
  unreadCount: number;
  typing: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deleted: boolean;
  deliveredAt: string | null;
  readAt: string | null;
};

export type ReceiptUpdate = {
  messageId: string;
  deliveredAt: string | null;
  readAt: string | null;
};

export type PresenceUpdate = {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
};

export type SyncPayload = {
  serverTime: string;
  me: Pick<MyProfile, "role" | "status" | "statusReason">;
  inbox: ConversationPreview[];
  messages: ChatMessage[];
  receipts: ReceiptUpdate[];
  presence: PresenceUpdate[];
  typingUserIds: string[];
};

export type ReportSummary = {
  id: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  status: ReportStatus;
  createdAt: string;
  targetHandle: string | null;
};

export type ReportEvidenceItem = {
  id: string;
  messageId: string | null;
  senderHandle: string | null;
  senderName: string | null;
  body: string;
  sentAt: string;
  isReported: boolean;
};

export type AdminReport = {
  id: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter: { userId: string; handle: string; displayName: string };
  targetUser: { userId: string; handle: string; displayName: string; status: AccountStatus } | null;
  evidence: ReportEvidenceItem[];
  resolutionNote: string | null;
};

export type AdminUserRow = {
  userId: string;
  displayName: string;
  handle: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  lastSeenAt: string | null;
  reportCount: number;
};

export type AuditLogRow = {
  id: string;
  actorId: string;
  actorHandle: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  targetUserId: string | null;
  targetHandle: string | null;
  metadata: string | null;
  createdAt: string;
};

export type ModerationActionRow = {
  id: string;
  actorId: string;
  actorHandle: string | null;
  targetUserId: string;
  targetHandle: string | null;
  action: string;
  reason: string | null;
  createdAt: string;
};
