import { i as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as REPORT_REASONS, l as authMiddleware, o as REPORT_STATUSES, s as REPORT_TARGETS } from "./middleware-CR0SyJR2.mjs";
import { cn as _enum, dn as boolean, gn as object, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DZhnqqWa.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var conversationId = string().min(1).max(80);
var userId = string().min(1).max(80);
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "2ba832d3c0efb9261b393ea60894c9fdd4259529b1b5678619ae8c75ed76bf09",
	name: "getMyProfile",
	filename: "src/lib/nexa/api.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
	const { getMyProfileImpl } = await import("./profile.server-tfTO6SXK.mjs");
	return getMyProfileImpl(context.userId);
});
var updateMyProfile_createServerFn_handler = createServerRpc({
	id: "225cd4aaf52aae10d8236eaff15f0c494ae0fe318781459f93adf33a44394e57",
	name: "updateMyProfile",
	filename: "src/lib/nexa/api.ts"
}, (opts) => updateMyProfile.__executeServer(opts));
var updateMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().min(1).max(40),
	handle: string().min(3).max(24)
})).handler(updateMyProfile_createServerFn_handler, async ({ context, data }) => {
	const { updateMyProfileImpl } = await import("./profile.server-tfTO6SXK.mjs");
	return updateMyProfileImpl(context.userId, data);
});
var searchUsers_createServerFn_handler = createServerRpc({
	id: "b8d872a523288d5b54326e15777fc2e0e1544f757d94bb5d79246ddaf7163b4d",
	name: "searchUsers",
	filename: "src/lib/nexa/api.ts"
}, (opts) => searchUsers.__executeServer(opts));
var searchUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ query: string().max(60) })).handler(searchUsers_createServerFn_handler, async ({ context, data }) => {
	const { searchUsersImpl } = await import("./profile.server-tfTO6SXK.mjs");
	return searchUsersImpl(context.userId, data.query);
});
var listConversations_createServerFn_handler = createServerRpc({
	id: "9c49306211c0482ee95b0967392cbce42302f0da2a728fc396aea036b471e306",
	name: "listConversations",
	filename: "src/lib/nexa/api.ts"
}, (opts) => listConversations.__executeServer(opts));
var listConversations = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ cursor: string().nullable() })).handler(listConversations_createServerFn_handler, async ({ context, data }) => {
	const { listConversationsImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return listConversationsImpl(context.userId, data.cursor);
});
var startConversation_createServerFn_handler = createServerRpc({
	id: "0cadcd592c7d53aab849665ff812a865e2aa1b4c6d02642e459216f416741766",
	name: "startConversation",
	filename: "src/lib/nexa/api.ts"
}, (opts) => startConversation.__executeServer(opts));
var startConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ otherUserId: userId })).handler(startConversation_createServerFn_handler, async ({ context, data }) => {
	const { startConversationImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return startConversationImpl(context.userId, data.otherUserId);
});
var getConversation_createServerFn_handler = createServerRpc({
	id: "ff314e18dcf9b978ee093bbb6b59ad135ee60beda66d10f8bd4618bcb22c9e3b",
	name: "getConversation",
	filename: "src/lib/nexa/api.ts"
}, (opts) => getConversation.__executeServer(opts));
var getConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ conversationId })).handler(getConversation_createServerFn_handler, async ({ context, data }) => {
	const { getConversationImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return getConversationImpl(context.userId, data.conversationId);
});
var listMessages_createServerFn_handler = createServerRpc({
	id: "976325146c401cbf2f4193beef2dc4c3ad22955aa8c9927e18f4b70e98f741d6",
	name: "listMessages",
	filename: "src/lib/nexa/api.ts"
}, (opts) => listMessages.__executeServer(opts));
var listMessages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	before: string().nullable()
})).handler(listMessages_createServerFn_handler, async ({ context, data }) => {
	const { listMessagesImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return listMessagesImpl(context.userId, data.conversationId, data.before);
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "96e60bf73b788ded604939b3d45194153c4bbfa878f35ab33b8d5e8d7ec371e1",
	name: "sendMessage",
	filename: "src/lib/nexa/api.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	body: string().min(1).max(4e3),
	clientId: string().uuid().optional()
})).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	const { sendMessageImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return sendMessageImpl(context.userId, data);
});
var markRead_createServerFn_handler = createServerRpc({
	id: "f46b2d93443299fec2da80f6ef5418700ef8ba21170767fbb6e606139e7b76a3",
	name: "markRead",
	filename: "src/lib/nexa/api.ts"
}, (opts) => markRead.__executeServer(opts));
var markRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	messageId: string().nullable()
})).handler(markRead_createServerFn_handler, async ({ context, data }) => {
	const { markReadImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return markReadImpl(context.userId, data.conversationId, data.messageId);
});
var setTyping_createServerFn_handler = createServerRpc({
	id: "a90e42aed1da0d66e36824fb65012ac720f62c807efd7c7f7d439c307aa3f300",
	name: "setTyping",
	filename: "src/lib/nexa/api.ts"
}, (opts) => setTyping.__executeServer(opts));
var setTyping = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	typing: boolean()
})).handler(setTyping_createServerFn_handler, async ({ context, data }) => {
	const { setTypingImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return setTypingImpl(context.userId, data.conversationId, data.typing);
});
var syncState_createServerFn_handler = createServerRpc({
	id: "2fc802c0b58a7642a829c05379bd73da9545685ee81631fc49f6463b7e84af94",
	name: "syncState",
	filename: "src/lib/nexa/api.ts"
}, (opts) => syncState.__executeServer(opts));
var syncState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	inboxAfter: string().nullable(),
	conversationId: string().nullable(),
	afterCreatedAt: string().nullable(),
	peerIds: array(string()).max(40)
})).handler(syncState_createServerFn_handler, async ({ context, data }) => {
	const { syncImpl } = await import("./chat.server-CXPe0uy7.mjs");
	return syncImpl(context.userId, data);
});
var createReport_createServerFn_handler = createServerRpc({
	id: "6be71f0a93acd9df79627d7029bf9abf4cb143aa91ff47ac685bcdf4e144148a",
	name: "createReport",
	filename: "src/lib/nexa/api.ts"
}, (opts) => createReport.__executeServer(opts));
var createReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetType: _enum(REPORT_TARGETS),
	reason: _enum(REPORT_REASONS),
	details: string().max(2e3).optional(),
	targetUserId: string().optional(),
	conversationId: string().optional(),
	messageIds: array(string()).max(5).optional()
})).handler(createReport_createServerFn_handler, async ({ context, data }) => {
	const { createReportImpl } = await import("./reports.server-DFSTaxjU.mjs");
	return createReportImpl(context.userId, data);
});
var listMyReports_createServerFn_handler = createServerRpc({
	id: "2ab82a38928240f121d57d47218f2d0171e330fc265d997884fff35236c36d1d",
	name: "listMyReports",
	filename: "src/lib/nexa/api.ts"
}, (opts) => listMyReports.__executeServer(opts));
var listMyReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyReports_createServerFn_handler, async ({ context }) => {
	const { listMyReportsImpl } = await import("./reports.server-DFSTaxjU.mjs");
	return listMyReportsImpl(context.userId);
});
var adminListReports_createServerFn_handler = createServerRpc({
	id: "1006bfd1b38350fdd326a6d1094d7b533d70f9b7a4f6f5713c154f4696bc77aa",
	name: "adminListReports",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminListReports.__executeServer(opts));
var adminListReports = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ status: _enum([...REPORT_STATUSES, "all"]) })).handler(adminListReports_createServerFn_handler, async ({ context, data }) => {
	const { adminListReportsImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminListReportsImpl(context.userId, data.status);
});
var adminGetReport_createServerFn_handler = createServerRpc({
	id: "a35c9b83c5bb528279a2e5ca4385443e277f064fb29f5c80a568a9d10a221011",
	name: "adminGetReport",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminGetReport.__executeServer(opts));
var adminGetReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ reportId: string().min(1) })).handler(adminGetReport_createServerFn_handler, async ({ context, data }) => {
	const { adminGetReportImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminGetReportImpl(context.userId, data.reportId);
});
var adminUpdateReport_createServerFn_handler = createServerRpc({
	id: "8f1f62f3ff9b67a7791688ffca9b508e00b0ab63399bedc09eda01e3213fdbbe",
	name: "adminUpdateReport",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminUpdateReport.__executeServer(opts));
var adminUpdateReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	reportId: string().min(1),
	status: _enum(REPORT_STATUSES),
	note: string().max(2e3).optional()
})).handler(adminUpdateReport_createServerFn_handler, async ({ context, data }) => {
	const { adminUpdateReportImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminUpdateReportImpl(context.userId, data);
});
var adminListUsers_createServerFn_handler = createServerRpc({
	id: "1c3a2e05410b441f7803ca04498735e3128281f6aac2553f5e837012e9928b00",
	name: "adminListUsers",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminListUsers.__executeServer(opts));
var adminListUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ query: string().max(60) })).handler(adminListUsers_createServerFn_handler, async ({ context, data }) => {
	const { adminListUsersImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminListUsersImpl(context.userId, data.query);
});
var adminGetUser_createServerFn_handler = createServerRpc({
	id: "fb8be9ab084d6b1aaafe908e2f540c45ae66c7fc633a22d276b57719aaebb351",
	name: "adminGetUser",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminGetUser.__executeServer(opts));
var adminGetUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ targetUserId: userId })).handler(adminGetUser_createServerFn_handler, async ({ context, data }) => {
	const { adminGetUserImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminGetUserImpl(context.userId, data.targetUserId);
});
var adminModerateUser_createServerFn_handler = createServerRpc({
	id: "ad8efb36ccf97642c70301291fbe7bfd362708214dc7af3d5caae60bc1dd1673",
	name: "adminModerateUser",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminModerateUser.__executeServer(opts));
var adminModerateUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	action: _enum([
		"warn",
		"suspend",
		"ban",
		"reactivate"
	]),
	reason: string().max(500).optional()
})).handler(adminModerateUser_createServerFn_handler, async ({ context, data }) => {
	const { adminModerateUserImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminModerateUserImpl(context.userId, data);
});
var adminListActions_createServerFn_handler = createServerRpc({
	id: "c24be15eaa0ab1d0be3a3a4440e2d900688e9c5b164cbb37fb5f95687580f524",
	name: "adminListActions",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminListActions.__executeServer(opts));
var adminListActions = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminListActions_createServerFn_handler, async ({ context }) => {
	const { adminListActionsImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminListActionsImpl(context.userId);
});
var adminListAudit_createServerFn_handler = createServerRpc({
	id: "f89bb9794ed99fcb2667ad17528d9aa53af67004eaa99f91ff64d3a22c95f5d1",
	name: "adminListAudit",
	filename: "src/lib/nexa/api.ts"
}, (opts) => adminListAudit.__executeServer(opts));
var adminListAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminListAudit_createServerFn_handler, async ({ context }) => {
	const { adminListAuditImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return adminListAuditImpl(context.userId);
});
var ownerListAdmins_createServerFn_handler = createServerRpc({
	id: "1911b6eba72e37948f63a5b025e00cb921550efd3e0a9236e945454fd0004654",
	name: "ownerListAdmins",
	filename: "src/lib/nexa/api.ts"
}, (opts) => ownerListAdmins.__executeServer(opts));
var ownerListAdmins = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(ownerListAdmins_createServerFn_handler, async ({ context }) => {
	const { ownerListAdminsImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return ownerListAdminsImpl(context.userId);
});
var ownerSetAdmin_createServerFn_handler = createServerRpc({
	id: "af0dc8f9ed7bc717b5fa74c35e8d2fe144f0b2ca3c637617bdf18472657de9d9",
	name: "ownerSetAdmin",
	filename: "src/lib/nexa/api.ts"
}, (opts) => ownerSetAdmin.__executeServer(opts));
var ownerSetAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	makeAdmin: boolean()
})).handler(ownerSetAdmin_createServerFn_handler, async ({ context, data }) => {
	const { ownerSetAdminImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return ownerSetAdminImpl(context.userId, data);
});
var ownerSuspendAdmin_createServerFn_handler = createServerRpc({
	id: "3009717d2d2c7ee1e71fec91f6e7af1d80ed16da9045c82df4ed3a4cc2344aab",
	name: "ownerSuspendAdmin",
	filename: "src/lib/nexa/api.ts"
}, (opts) => ownerSuspendAdmin.__executeServer(opts));
var ownerSuspendAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	suspend: boolean(),
	reason: string().max(500).optional()
})).handler(ownerSuspendAdmin_createServerFn_handler, async ({ context, data }) => {
	const { ownerSuspendAdminImpl } = await import("./admin.server-BnGtqzDb.mjs");
	return ownerSuspendAdminImpl(context.userId, data);
});
//#endregion
export { adminGetReport_createServerFn_handler, adminGetUser_createServerFn_handler, adminListActions_createServerFn_handler, adminListAudit_createServerFn_handler, adminListReports_createServerFn_handler, adminListUsers_createServerFn_handler, adminModerateUser_createServerFn_handler, adminUpdateReport_createServerFn_handler, createReport_createServerFn_handler, getConversation_createServerFn_handler, getMyProfile_createServerFn_handler, listConversations_createServerFn_handler, listMessages_createServerFn_handler, listMyReports_createServerFn_handler, markRead_createServerFn_handler, ownerListAdmins_createServerFn_handler, ownerSetAdmin_createServerFn_handler, ownerSuspendAdmin_createServerFn_handler, searchUsers_createServerFn_handler, sendMessage_createServerFn_handler, setTyping_createServerFn_handler, startConversation_createServerFn_handler, syncState_createServerFn_handler, updateMyProfile_createServerFn_handler };
