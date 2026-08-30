import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  escapeIlike,
  handleFromName,
  isUuid,
  normalizeHandle,
  planEvidence,
  sanitizeBody,
} from "./evidence.ts";

const thread = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}` }));

describe("planEvidence", () => {
  it("returns nothing without a valid selection", () => {
    assert.deepEqual(planEvidence([], thread), []);
    assert.deepEqual(planEvidence(["missing"], thread), []);
  });

  it("includes one message of context on each side for a single selection", () => {
    const planned = planEvidence(["m4"], thread);
    assert.deepEqual(
      planned.map((p) => p.id),
      ["m3", "m4", "m5"],
    );
    assert.equal(planned.find((p) => p.id === "m4")?.isReported, true);
    assert.equal(planned.find((p) => p.id === "m3")?.isReported, false);
    assert.equal(planned.find((p) => p.id === "m5")?.isReported, false);
  });

  it("does not dump the rest of the thread", () => {
    const planned = planEvidence(["m4"], thread);
    assert.equal(planned.length <= 5, true);
    assert.equal(planned.some((p) => p.id === "m0"), false);
    assert.equal(planned.some((p) => p.id === "m9"), false);
  });

  it("caps multiple selections and marks only those as reported", () => {
    const planned = planEvidence(["m1", "m2", "m3", "m7", "m8", "m9"], thread, { maxTotal: 5 });
    assert.equal(planned.length, 5);
    assert.equal(planned.every((p) => p.isReported), true);
  });

  it("handles the first and last messages without inventing neighbors", () => {
    const first = planEvidence(["m0"], thread);
    assert.deepEqual(
      first.map((p) => p.id),
      ["m0", "m1"],
    );
    const last = planEvidence(["m9"], thread);
    assert.deepEqual(
      last.map((p) => p.id),
      ["m8", "m9"],
    );
  });
});

describe("input hygiene", () => {
  it("escapes ilike wildcards", () => {
    assert.equal(escapeIlike("a%b_c\\d"), "a\\%b\\_c\\\\d");
  });

  it("normalizes handles and derives them from names", () => {
    assert.equal(normalizeHandle("Ada Lovelace!"), "adalovelace");
    assert.equal(handleFromName("Ada Lovelace", "ada@example.com"), "adalovelace");
  });

  it("strips nulls and trims message bodies", () => {
    assert.equal(sanitizeBody("  hello\u0000\r\nthere  ", 4000), "hello\nthere");
    assert.equal(sanitizeBody("   ", 4000), "");
  });

  it("accepts only uuid-shaped client ids", () => {
    assert.equal(isUuid("2c9c0b3e-1c4a-4b7d-9e2a-7f3c1d0a9b8c"), true);
    assert.equal(isUuid("not-a-uuid"), false);
    assert.equal(isUuid("2c9c0b3e-1c4a-4b7d-9e2a-7f3c1d0a9b8c' or 1=1"), false);
  });
});
