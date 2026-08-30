import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as REPORT_REASONS, l as authMiddleware, o as REPORT_STATUSES, s as REPORT_TARGETS } from "./middleware-CR0SyJR2.mjs";
import { cn as _enum, dn as boolean, gn as object, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CGkd5JiH.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var conversationId = string().min(1).max(80);
var userId = string().min(1).max(80);
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2ba832d3c0efb9261b393ea60894c9fdd4259529b1b5678619ae8c75ed76bf09"));
var updateMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().min(1).max(40),
	handle: string().min(3).max(24)
})).handler(createSsrRpc("225cd4aaf52aae10d8236eaff15f0c494ae0fe318781459f93adf33a44394e57"));
var searchUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ query: string().max(60) })).handler(createSsrRpc("b8d872a523288d5b54326e15777fc2e0e1544f757d94bb5d79246ddaf7163b4d"));
var listConversations = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ cursor: string().nullable() })).handler(createSsrRpc("9c49306211c0482ee95b0967392cbce42302f0da2a728fc396aea036b471e306"));
var startConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ otherUserId: userId })).handler(createSsrRpc("0cadcd592c7d53aab849665ff812a865e2aa1b4c6d02642e459216f416741766"));
var getConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ conversationId })).handler(createSsrRpc("ff314e18dcf9b978ee093bbb6b59ad135ee60beda66d10f8bd4618bcb22c9e3b"));
var listMessages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	before: string().nullable()
})).handler(createSsrRpc("976325146c401cbf2f4193beef2dc4c3ad22955aa8c9927e18f4b70e98f741d6"));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	body: string().min(1).max(4e3),
	clientId: string().uuid().optional()
})).handler(createSsrRpc("96e60bf73b788ded604939b3d45194153c4bbfa878f35ab33b8d5e8d7ec371e1"));
var markRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	messageId: string().nullable()
})).handler(createSsrRpc("f46b2d93443299fec2da80f6ef5418700ef8ba21170767fbb6e606139e7b76a3"));
var setTyping = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	conversationId,
	typing: boolean()
})).handler(createSsrRpc("a90e42aed1da0d66e36824fb65012ac720f62c807efd7c7f7d439c307aa3f300"));
var syncState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	inboxAfter: string().nullable(),
	conversationId: string().nullable(),
	afterCreatedAt: string().nullable(),
	peerIds: array(string()).max(40)
})).handler(createSsrRpc("2fc802c0b58a7642a829c05379bd73da9545685ee81631fc49f6463b7e84af94"));
var createReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetType: _enum(REPORT_TARGETS),
	reason: _enum(REPORT_REASONS),
	details: string().max(2e3).optional(),
	targetUserId: string().optional(),
	conversationId: string().optional(),
	messageIds: array(string()).max(5).optional()
})).handler(createSsrRpc("6be71f0a93acd9df79627d7029bf9abf4cb143aa91ff47ac685bcdf4e144148a"));
var listMyReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2ab82a38928240f121d57d47218f2d0171e330fc265d997884fff35236c36d1d"));
var adminListReports = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ status: _enum([...REPORT_STATUSES, "all"]) })).handler(createSsrRpc("1006bfd1b38350fdd326a6d1094d7b533d70f9b7a4f6f5713c154f4696bc77aa"));
var adminGetReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ reportId: string().min(1) })).handler(createSsrRpc("a35c9b83c5bb528279a2e5ca4385443e277f064fb29f5c80a568a9d10a221011"));
var adminUpdateReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	reportId: string().min(1),
	status: _enum(REPORT_STATUSES),
	note: string().max(2e3).optional()
})).handler(createSsrRpc("8f1f62f3ff9b67a7791688ffca9b508e00b0ab63399bedc09eda01e3213fdbbe"));
var adminListUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ query: string().max(60) })).handler(createSsrRpc("1c3a2e05410b441f7803ca04498735e3128281f6aac2553f5e837012e9928b00"));
var adminGetUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ targetUserId: userId })).handler(createSsrRpc("fb8be9ab084d6b1aaafe908e2f540c45ae66c7fc633a22d276b57719aaebb351"));
var adminModerateUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	action: _enum([
		"warn",
		"suspend",
		"ban",
		"reactivate"
	]),
	reason: string().max(500).optional()
})).handler(createSsrRpc("ad8efb36ccf97642c70301291fbe7bfd362708214dc7af3d5caae60bc1dd1673"));
var adminListActions = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c24be15eaa0ab1d0be3a3a4440e2d900688e9c5b164cbb37fb5f95687580f524"));
var adminListAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f89bb9794ed99fcb2667ad17528d9aa53af67004eaa99f91ff64d3a22c95f5d1"));
var ownerListAdmins = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1911b6eba72e37948f63a5b025e00cb921550efd3e0a9236e945454fd0004654"));
var ownerSetAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	makeAdmin: boolean()
})).handler(createSsrRpc("af0dc8f9ed7bc717b5fa74c35e8d2fe144f0b2ca3c637617bdf18472657de9d9"));
var ownerSuspendAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	targetUserId: userId,
	suspend: boolean(),
	reason: string().max(500).optional()
})).handler(createSsrRpc("3009717d2d2c7ee1e71fec91f6e7af1d80ed16da9045c82df4ed3a4cc2344aab"));
//#endregion
export { syncState as C, startConversation as S, ownerSetAdmin as _, adminListReports as a, sendMessage as b, adminUpdateReport as c, getMyProfile as d, listConversations as f, ownerListAdmins as g, markRead as h, adminListAudit as i, createReport as l, listMyReports as m, adminGetUser as n, adminListUsers as o, listMessages as p, adminListActions as r, adminModerateUser as s, adminGetReport as t, getConversation as u, ownerSuspendAdmin as v, updateMyProfile as w, setTyping as x, searchUsers as y };
