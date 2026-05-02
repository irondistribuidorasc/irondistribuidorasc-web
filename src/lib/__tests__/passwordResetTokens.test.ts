import { describe, expect, it } from "vitest";

import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "../password-reset-tokens";

describe("password reset tokens", () => {
  it("gera token puro e hash diferentes", () => {
    const resetToken = createPasswordResetToken();

    expect(resetToken.token).toHaveLength(64);
    expect(resetToken.hashedToken).toHaveLength(64);
    expect(resetToken.hashedToken).not.toBe(resetToken.token);
  });

  it("gera hash deterministico para consulta do token recebido", () => {
    const token = "reset-token-from-link";

    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token));
    expect(hashPasswordResetToken(token)).not.toBe(token);
  });

  it("gera tokens aleatorios diferentes", () => {
    const firstToken = createPasswordResetToken();
    const secondToken = createPasswordResetToken();

    expect(firstToken.token).not.toBe(secondToken.token);
    expect(firstToken.hashedToken).not.toBe(secondToken.hashedToken);
  });
});
