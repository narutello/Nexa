import { t as NexaError } from "./errors-qjtEjvj0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authz-BLpDbWRQ.js
function toActor(row) {
	return {
		userId: row.user_id,
		role: row.role,
		status: row.status
	};
}
function isStaff(role) {
	return role === "ADMIN" || role === "OWNER";
}
function canUseChat(status) {
	return status === "active" || status === "warned";
}
function assertCanUseChat(actor) {
	if (actor.status === "banned") throw new NexaError("This account has been banned.", 403, "BANNED");
	if (actor.status === "suspended") throw new NexaError("This account is suspended.", 403, "SUSPENDED");
}
function assertStaff(actor) {
	if (!isStaff(actor.role) || !canUseChat(actor.status)) throw new NexaError("Not authorized.", 403, "FORBIDDEN");
}
function assertOwner(actor) {
	if (actor.role !== "OWNER" || actor.status !== "active") throw new NexaError("Not authorized.", 403, "FORBIDDEN");
}
/**
* Conversation access is membership-only. Staff roles never bypass this.
* There is no administrative read of private threads.
*/
function assertConversationAccess(opts) {
	if (!opts.isMember) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
}
/**
* Admins may see frozen report evidence only — never a live conversation.
*/
function canViewReportEvidence(actor) {
	return isStaff(actor.role) && canUseChat(actor.status);
}
function assertCanViewReportEvidence(actor) {
	if (!canViewReportEvidence(actor)) throw new NexaError("Not authorized.", 403, "FORBIDDEN");
}
function assertCanModerateUser(actor, target) {
	assertStaff(actor);
	if (target.role === "OWNER") throw new NexaError("The owner cannot be modified this way.", 403, "FORBIDDEN");
	if (target.role === "ADMIN" && actor.role !== "OWNER") throw new NexaError("Only the owner can moderate admins.", 403, "FORBIDDEN");
	if (target.userId === actor.userId && target.role === "ADMIN") throw new NexaError("You cannot change your own admin access.", 403, "FORBIDDEN");
}
function assertCanManageAdmins(actor) {
	assertOwner(actor);
}
function assertNotSelfTarget(actorId, targetId, verb) {
	if (actorId === targetId) throw new NexaError(`You cannot ${verb} yourself.`, 400, "BAD_REQUEST");
}
//#endregion
export { assertConversationAccess as a, assertStaff as c, assertCanViewReportEvidence as i, isStaff as l, assertCanModerateUser as n, assertNotSelfTarget as o, assertCanUseChat as r, assertOwner as s, assertCanManageAdmins as t, toActor as u };
