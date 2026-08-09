import { describe, expect, it } from "vitest";
import { encryptMobile, decryptMobile, hashMobile, maskMobile } from "./mobile-crypto";

describe("mobile-crypto", () => {
  it("hashes stably and masks display", () => {
    const mobile = "19900001001";
    expect(hashMobile(mobile)).toBe(hashMobile(mobile));
    expect(maskMobile(mobile)).toBe("199****1001");
  });

  it("round-trips encryption", () => {
    const mobile = "19900001002";
    const enc = encryptMobile(mobile);
    expect(enc).not.toContain(mobile);
    expect(decryptMobile(enc)).toBe(mobile);
  });
});
