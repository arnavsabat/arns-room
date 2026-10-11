import test from "node:test";
import assert from "node:assert/strict";
import { resolveRoomEntry } from "./world";

test("resolveRoomEntry clamps invalid coordinates to the room bounds", () => {
  const safe = resolveRoomEntry("contact", { gx: 999, gy: 999 });
  assert.deepEqual(safe, { gx: 5, gy: 4 });
});

test("resolveRoomEntry preserves valid coordinates for a real room", () => {
  const safe = resolveRoomEntry("contact", { gx: 1, gy: 1 });
  assert.deepEqual(safe, { gx: 1, gy: 1 });
});

test("resolveRoomEntry rejects unknown rooms", () => {
  assert.equal(resolveRoomEntry("missing-room", { gx: 1, gy: 1 }), null);
});
