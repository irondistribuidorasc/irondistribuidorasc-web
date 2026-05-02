import { createHash, randomBytes } from "node:crypto";

export interface PasswordResetToken {
  token: string;
  hashedToken: string;
}

export function createPasswordResetToken(): PasswordResetToken {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    hashedToken: hashPasswordResetToken(token),
  };
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
