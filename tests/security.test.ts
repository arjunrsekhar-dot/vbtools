import test from "node:test";
import assert from "node:assert/strict";
import { safeUrl, sanitizeText } from "../lib/input-security";
import { toolQuerySchema } from "../lib/tool-query";

test("safeUrl allows only http and https URLs", () => {
  assert.equal(safeUrl("https://example.com/path"), "https://example.com/path");
  assert.throws(() => safeUrl("javascript:alert(1)"));
  assert.throws(() => safeUrl("data:text/html,<script>alert(1)</script>"));
  assert.throws(() => safeUrl("file:///etc/passwd"));
  assert.throws(() => safeUrl("not a url"));
});

test("sanitizeText normalizes, trims, strips controls, and caps length", () => {
  assert.equal(sanitizeText(" \u0000Hello\u0007 ", 20), "Hello");
  assert.equal(sanitizeText("abcdef", 3), "abc");
  assert.equal(sanitizeText("ｅｘａｍｐｌｅ", 20), "example");
});

test("tool search rejects abusive pagination", () => {
  const parsed = toolQuerySchema.safeParse({ pageSize: "5000" });
  assert.equal(parsed.success, false);
});

test("tool search accepts only allowlisted sort fields", () => {
  assert.equal(toolQuerySchema.safeParse({ sort: "rating", pageSize: "5" }).success, true);
  assert.equal(toolQuerySchema.safeParse({ sort: "ownerId" }).success, false);
});
