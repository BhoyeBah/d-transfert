import { describe, expect, it } from "vitest";

import { createNationalOperationSchema } from "./national-operations";

function line(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    wallet_id: "wallet-1",
    direction: "in",
    amount: 1000,
    currency: "XOF",
    ...overrides,
  };
}

describe("createNationalOperationSchema", () => {
  it("accepts a balanced two-line operation on distinct wallets", () => {
    const result = createNationalOperationSchema.safeParse({
      lines: [line({ wallet_id: "wallet-1", direction: "in" }), line({ wallet_id: "wallet-2", direction: "out" })],
    });
    expect(result.success).toBe(true);
  });

  it("rejects fewer than 2 lines", () => {
    const result = createNationalOperationSchema.safeParse({ lines: [line()] });
    expect(result.success).toBe(false);
  });

  it("rejects two lines targeting the same wallet", () => {
    const result = createNationalOperationSchema.safeParse({
      lines: [
        line({ wallet_id: "wallet-1", direction: "in" }),
        line({ wallet_id: "wallet-1", direction: "out" }),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive line amount", () => {
    const result = createNationalOperationSchema.safeParse({
      lines: [
        line({ wallet_id: "wallet-1", amount: 0 }),
        line({ wallet_id: "wallet-2", direction: "out" }),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive exchange rate", () => {
    const result = createNationalOperationSchema.safeParse({
      exchange_rate: 0,
      lines: [line({ wallet_id: "wallet-1" }), line({ wallet_id: "wallet-2", direction: "out" })],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a positive exchange rate", () => {
    const result = createNationalOperationSchema.safeParse({
      exchange_rate: 655.5,
      lines: [line({ wallet_id: "wallet-1" }), line({ wallet_id: "wallet-2", direction: "out" })],
    });
    expect(result.success).toBe(true);
  });
});
