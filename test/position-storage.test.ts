import { beforeEach, describe, expect, it } from "vitest";
import { clearPosition, readPosition, writePosition } from "../src/storage/position";

describe("position storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a position", () => {
    writePosition("key", { x: 10, y: 20 });
    expect(readPosition("key")).toEqual({ x: 10, y: 20 });
  });

  it("returns null when nothing is stored", () => {
    expect(readPosition("missing")).toBeNull();
  });

  it("returns null for corrupt JSON instead of throwing", () => {
    window.localStorage.setItem("key", "{not json");
    expect(readPosition("key")).toBeNull();
  });

  it("returns null for malformed shapes", () => {
    window.localStorage.setItem("key", JSON.stringify({ x: "10" }));
    expect(readPosition("key")).toBeNull();
  });

  it("clearPosition removes the stored value", () => {
    writePosition("key", { x: 1, y: 2 });
    clearPosition("key");
    expect(readPosition("key")).toBeNull();
  });
});
