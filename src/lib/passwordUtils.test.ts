import { describe, expect, it } from "vitest";
import { calculateStrength, generatePassword } from "./passwordUtils";

const ALL = { uppercase: true, lowercase: true, numbers: true, symbols: true };

describe("generatePassword", () => {
  it("returns an empty string when no character set is enabled", () => {
    expect(
      generatePassword(16, { uppercase: false, lowercase: false, numbers: false, symbols: false }),
    ).toBe("");
  });

  it("produces the requested length", () => {
    for (const length of [4, 8, 16, 64]) {
      expect(generatePassword(length, ALL)).toHaveLength(length);
    }
  });

  it("only uses characters from enabled sets", () => {
    const password = generatePassword(64, { ...ALL, symbols: false, numbers: false });
    expect(password).toMatch(/^[A-Za-z]+$/);
  });

  it("includes at least one character from every enabled set", () => {
    for (let i = 0; i < 50; i++) {
      const password = generatePassword(4, ALL);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    }
  });

  it("does not repeat the same output across calls", () => {
    const outputs = new Set(Array.from({ length: 100 }, () => generatePassword(16, ALL)));
    expect(outputs.size).toBe(100);
  });
});

describe("calculateStrength", () => {
  it("rates an empty password as Very Weak", () => {
    expect(calculateStrength("")).toMatchObject({ tier: 0, label: "Very Weak" });
  });

  it("penalises repeated single characters", () => {
    expect(calculateStrength("aaaaaaaaaaaaaaaa").tier).toBe(0);
  });

  it("rates a long mixed-character password as Unbreakable", () => {
    expect(calculateStrength("Tr0ub4dor&3-Horse!Battery#Staple").label).toBe("Unbreakable");
  });

  it("orders tiers monotonically by strength", () => {
    const tiers = ["a", "abc123", "Abc123!@", "Abcdefghijk1!", "Abcdefghijklmnop1!@#Xyz"].map(
      (pw) => calculateStrength(pw).tier,
    );
    expect(tiers).toEqual([...tiers].sort((a, b) => a - b));
  });
});
