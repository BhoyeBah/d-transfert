import { describe, expect, it } from "vitest";

import { createTransferSchema } from "./transfers";

function validPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    collaboration_id: "collab-1",
    amount: 1000,
    currency: "XOF",
    beneficiary_phone: "770000000",
    send_mode: "cash",
    ...overrides,
  };
}

describe("createTransferSchema", () => {
  it("accepts a valid payload", () => {
    const result = createTransferSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative amount", () => {
    expect(createTransferSchema.safeParse(validPayload({ amount: 0 })).success).toBe(false);
    expect(createTransferSchema.safeParse(validPayload({ amount: -100 })).success).toBe(false);
  });

  it("rejects a missing collaboration", () => {
    const result = createTransferSchema.safeParse(validPayload({ collaboration_id: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a currency code that is too short", () => {
    const result = createTransferSchema.safeParse(validPayload({ currency: "X" }));
    expect(result.success).toBe(false);
  });

  it("rejects an unknown send mode", () => {
    const result = createTransferSchema.safeParse(validPayload({ send_mode: "cheque" }));
    expect(result.success).toBe(false);
  });

  it("rejects a missing beneficiary phone", () => {
    const result = createTransferSchema.safeParse(validPayload({ beneficiary_phone: "" }));
    expect(result.success).toBe(false);
  });

  it("accepts an optional target currency and reliquat action", () => {
    const result = createTransferSchema.safeParse(
      validPayload({ target_currency: "EUR", reliquat_action: "fee" })
    );
    expect(result.success).toBe(true);
  });
});
