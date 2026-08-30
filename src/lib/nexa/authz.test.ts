import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertCanModerateUser,
  assertCanUseChat,
  assertCanViewReportEvidence,
  assertConversationAccess,
  assertOwner,
  assertStaff,
  canUseChat,
  isStaff,
  staffConversationBypassAttempt,
  type Actor,
} from "./authz.ts";
import { NexaError } from "./errors.ts";

const user: Actor = { userId: "u1", role: "USER", status: "active" };
const admin: Actor = { userId: "a1", role: "ADMIN", status: "active" };
const owner: Actor = { userId: "o1", role: "OWNER", status: "active" };
const suspendedAdmin: Actor = { userId: "a2", role: "ADMIN", status: "suspended" };

describe("role matrix", () => {
  it("treats only admin and owner as staff", () => {
    assert.equal(isStaff("USER"), false);
    assert.equal(isStaff("ADMIN"), true);
    assert.equal(isStaff("OWNER"), true);
  });

  it("blocks suspended and banned users from chat", () => {
    assert.equal(canUseChat("active"), true);
    assert.equal(canUseChat("warned"), true);
    assert.equal(canUseChat("suspended"), false);
    assert.equal(canUseChat("banned"), false);
    assert.throws(() => assertCanUseChat({ ...user, status: "banned" }), NexaError);
    assert.throws(() => assertCanUseChat({ ...user, status: "suspended" }), NexaError);
  });

  it("allows staff to review reports but not a suspended admin", () => {
    assert.doesNotThrow(() => assertCanViewReportEvidence(admin));
    assert.doesNotThrow(() => assertCanViewReportEvidence(owner));
    assert.throws(() => assertCanViewReportEvidence(user), NexaError);
    assert.throws(() => assertCanViewReportEvidence(suspendedAdmin), NexaError);
  });

  it("lets only the owner manage admins", () => {
    assert.doesNotThrow(() => assertOwner(owner));
    assert.throws(() => assertOwner(admin), NexaError);
    assert.throws(() => assertStaff(user), NexaError);
  });

  it("prevents admins from moderating the owner or other admins", () => {
    assert.throws(() => assertCanModerateUser(admin, owner), NexaError);
    assert.throws(() => assertCanModerateUser(admin, admin), NexaError);
    assert.doesNotThrow(() => assertCanModerateUser(admin, user));
    assert.doesNotThrow(() => assertCanModerateUser(owner, admin));
    assert.throws(() => assertCanModerateUser(owner, owner), NexaError);
  });
});

describe("private conversation authorization", () => {
  it("is membership-only, including for staff", () => {
    assert.doesNotThrow(() => assertConversationAccess({ isMember: true, actor: user }));
    assert.throws(() => assertConversationAccess({ isMember: false, actor: user }), NexaError);
    assert.throws(() => assertConversationAccess({ isMember: false, actor: admin }), NexaError);
    assert.throws(() => assertConversationAccess({ isMember: false, actor: owner }), NexaError);
  });

  it("flags staff bypass attempts so they can never be treated as success", () => {
    assert.equal(staffConversationBypassAttempt({ role: "ADMIN", isMember: false }), true);
    assert.equal(staffConversationBypassAttempt({ role: "OWNER", isMember: false }), true);
    assert.equal(staffConversationBypassAttempt({ role: "ADMIN", isMember: true }), false);
    assert.equal(staffConversationBypassAttempt({ role: "USER", isMember: false }), false);
  });
});
