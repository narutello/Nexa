import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(dir, name), "utf8");
}

describe("administrative privacy invariants", () => {
  it("does not expose a staff API to fetch live private messages", () => {
    const api = read("api.ts");
    const admin = read("admin.server.ts");
    const forbidden = [
      "adminListMessages",
      "adminGetMessages",
      "adminGetConversation",
      "adminListConversations",
      "adminSearchMessages",
      "adminReadThread",
    ];
    for (const name of forbidden) {
      assert.equal(api.includes(name), false, `api.ts must not export ${name}`);
      assert.equal(admin.includes(name), false, `admin.server.ts must not define ${name}`);
    }
  });

  it("loads report evidence from snapshots, not the live messages table", () => {
    const admin = read("admin.server.ts");
    assert.match(admin, /from report_evidence/);
    const getReport = admin.slice(admin.indexOf("adminGetReportImpl"));
    const fn = getReport.slice(0, getReport.indexOf("export async function adminUpdateReportImpl"));
    assert.equal(fn.includes("from messages"), false);
    assert.equal(fn.includes("join messages"), false);
  });

  it("records an audit log when report evidence is viewed", () => {
    const admin = read("admin.server.ts");
    assert.match(admin, /report\.evidence\.view/);
    assert.match(admin, /writeAudit/);
  });

  it("scopes conversation queries to membership", () => {
    const chat = read("chat.server.ts");
    assert.match(chat, /assertConversationAccess/);
    assert.match(chat, /conversation_members/);
    assert.equal(chat.includes("if (role === \"ADMIN\")"), false);
    assert.equal(chat.includes("if (role === \"OWNER\")"), false);
  });
});
