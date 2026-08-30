import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS } from "./types";

const conversationId = z.string().min(1).max(80);
const userId = z.string().min(1).max(80);

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getMyProfileImpl } = await import("./profile.server");
    return getMyProfileImpl(context.userId);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().min(1).max(40),
      handle: z.string().min(3).max(24),
    }),
  )
  .handler(async ({ context, data }) => {
    const { updateMyProfileImpl } = await import("./profile.server");
    return updateMyProfileImpl(context.userId, data);
  });

export const searchUsers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ query: z.string().max(60) }))
  .handler(async ({ context, data }) => {
    const { searchUsersImpl } = await import("./profile.server");
    return searchUsersImpl(context.userId, data.query);
  });

export const listConversations = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ cursor: z.string().nullable() }))
  .handler(async ({ context, data }) => {
    const { listConversationsImpl } = await import("./chat.server");
    return listConversationsImpl(context.userId, data.cursor);
  });

export const startConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ otherUserId: userId }))
  .handler(async ({ context, data }) => {
    const { startConversationImpl } = await import("./chat.server");
    return startConversationImpl(context.userId, data.otherUserId);
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ conversationId }))
  .handler(async ({ context, data }) => {
    const { getConversationImpl } = await import("./chat.server");
    return getConversationImpl(context.userId, data.conversationId);
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId,
      before: z.string().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { listMessagesImpl } = await import("./chat.server");
    return listMessagesImpl(context.userId, data.conversationId, data.before);
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId,
      body: z.string().min(1).max(4000),
      clientId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { sendMessageImpl } = await import("./chat.server");
    return sendMessageImpl(context.userId, data);
  });

export const markRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId,
      messageId: z.string().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { markReadImpl } = await import("./chat.server");
    return markReadImpl(context.userId, data.conversationId, data.messageId);
  });

export const setTyping = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId,
      typing: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { setTypingImpl } = await import("./chat.server");
    return setTypingImpl(context.userId, data.conversationId, data.typing);
  });

export const syncState = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      inboxAfter: z.string().nullable(),
      conversationId: z.string().nullable(),
      afterCreatedAt: z.string().nullable(),
      peerIds: z.array(z.string()).max(40),
    }),
  )
  .handler(async ({ context, data }) => {
    const { syncImpl } = await import("./chat.server");
    return syncImpl(context.userId, data);
  });

export const createReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      targetType: z.enum(REPORT_TARGETS),
      reason: z.enum(REPORT_REASONS),
      details: z.string().max(2000).optional(),
      targetUserId: z.string().optional(),
      conversationId: z.string().optional(),
      messageIds: z.array(z.string()).max(5).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { createReportImpl } = await import("./reports.server");
    return createReportImpl(context.userId, data);
  });

export const listMyReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listMyReportsImpl } = await import("./reports.server");
    return listMyReportsImpl(context.userId);
  });

export const adminListReports = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ status: z.enum([...REPORT_STATUSES, "all"]) }))
  .handler(async ({ context, data }) => {
    const { adminListReportsImpl } = await import("./admin.server");
    return adminListReportsImpl(context.userId, data.status);
  });

export const adminGetReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const { adminGetReportImpl } = await import("./admin.server");
    return adminGetReportImpl(context.userId, data.reportId);
  });

export const adminUpdateReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      reportId: z.string().min(1),
      status: z.enum(REPORT_STATUSES),
      note: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { adminUpdateReportImpl } = await import("./admin.server");
    return adminUpdateReportImpl(context.userId, data);
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ query: z.string().max(60) }))
  .handler(async ({ context, data }) => {
    const { adminListUsersImpl } = await import("./admin.server");
    return adminListUsersImpl(context.userId, data.query);
  });

export const adminGetUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ targetUserId: userId }))
  .handler(async ({ context, data }) => {
    const { adminGetUserImpl } = await import("./admin.server");
    return adminGetUserImpl(context.userId, data.targetUserId);
  });

export const adminModerateUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      targetUserId: userId,
      action: z.enum(["warn", "suspend", "ban", "reactivate"]),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { adminModerateUserImpl } = await import("./admin.server");
    return adminModerateUserImpl(context.userId, data);
  });

export const adminListActions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { adminListActionsImpl } = await import("./admin.server");
    return adminListActionsImpl(context.userId);
  });

export const adminListAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { adminListAuditImpl } = await import("./admin.server");
    return adminListAuditImpl(context.userId);
  });

export const ownerListAdmins = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { ownerListAdminsImpl } = await import("./admin.server");
    return ownerListAdminsImpl(context.userId);
  });

export const ownerSetAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ targetUserId: userId, makeAdmin: z.boolean() }))
  .handler(async ({ context, data }) => {
    const { ownerSetAdminImpl } = await import("./admin.server");
    return ownerSetAdminImpl(context.userId, data);
  });

export const ownerSuspendAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      targetUserId: userId,
      suspend: z.boolean(),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { ownerSuspendAdminImpl } = await import("./admin.server");
    return ownerSuspendAdminImpl(context.userId, data);
  });
