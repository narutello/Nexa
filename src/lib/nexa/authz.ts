import { NexaError } from "./errors.ts";
import type { AccountStatus, Role } from "./types.ts";

export type Actor = {
  userId: string;
  role: Role;
  status: AccountStatus;
};

export function toActor(row: {
  user_id: string;
  role: Role;
  status: AccountStatus;
}): Actor {
  return { userId: row.user_id, role: row.role, status: row.status };
}

export function isStaff(role: Role): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function canUseChat(status: AccountStatus): boolean {
  return status === "active" || status === "warned";
}

export function assertCanUseChat(actor: Actor): void {
  if (actor.status === "banned") {
    throw new NexaError("This account has been banned.", 403, "BANNED");
  }
  if (actor.status === "suspended") {
    throw new NexaError("This account is suspended.", 403, "SUSPENDED");
  }
}

export function assertStaff(actor: Actor): void {
  if (!isStaff(actor.role) || !canUseChat(actor.status)) {
    throw new NexaError("Not authorized.", 403, "FORBIDDEN");
  }
}

export function assertOwner(actor: Actor): void {
  if (actor.role !== "OWNER" || actor.status !== "active") {
    throw new NexaError("Not authorized.", 403, "FORBIDDEN");
  }
}

/**
 * Conversation access is membership-only. Staff roles never bypass this.
 * There is no administrative read of private threads.
 */
export function assertConversationAccess(opts: {
  isMember: boolean;
  actor?: Actor;
}): void {
  if (!opts.isMember) {
    throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
  }
}

/**
 * Admins may see frozen report evidence only — never a live conversation.
 */
export function canViewReportEvidence(actor: Actor): boolean {
  return isStaff(actor.role) && canUseChat(actor.status);
}

export function assertCanViewReportEvidence(actor: Actor): void {
  if (!canViewReportEvidence(actor)) {
    throw new NexaError("Not authorized.", 403, "FORBIDDEN");
  }
}

export function assertCanModerateUser(actor: Actor, target: Actor): void {
  assertStaff(actor);
  if (target.role === "OWNER") {
    throw new NexaError("The owner cannot be modified this way.", 403, "FORBIDDEN");
  }
  if (target.role === "ADMIN" && actor.role !== "OWNER") {
    throw new NexaError("Only the owner can moderate admins.", 403, "FORBIDDEN");
  }
  if (target.userId === actor.userId && target.role === "ADMIN") {
    throw new NexaError("You cannot change your own admin access.", 403, "FORBIDDEN");
  }
}

export function assertCanManageAdmins(actor: Actor): void {
  assertOwner(actor);
}

export function assertNotSelfTarget(actorId: string, targetId: string, verb: string): void {
  if (actorId === targetId) {
    throw new NexaError(`You cannot ${verb} yourself.`, 400, "BAD_REQUEST");
  }
}

/** True when a staff actor is trying to read a conversation they are not in. */
export function staffConversationBypassAttempt(opts: {
  role: Role;
  isMember: boolean;
}): boolean {
  return isStaff(opts.role) && !opts.isMember;
}
