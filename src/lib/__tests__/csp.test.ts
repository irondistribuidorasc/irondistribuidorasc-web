import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "../csp";

describe("buildContentSecurityPolicy", () => {
  it("remove unsafe-inline de script-src em producao e usa nonce", () => {
    const policy = buildContentSecurityPolicy({
      isDev: false,
      nonce: "test-nonce",
    });

    const scriptSrc = getDirective(policy, "script-src");

    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'nonce-test-nonce'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).toContain("https://va.vercel-scripts.com");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("mantem unsafe-eval apenas em desenvolvimento", () => {
    const policy = buildContentSecurityPolicy({
      isDev: true,
      nonce: "dev-nonce",
    });

    expect(getDirective(policy, "script-src")).toContain("'unsafe-eval'");
  });

  it("normaliza espacos e remove quebras de linha", () => {
    const policy = buildContentSecurityPolicy({
      isDev: false,
      nonce: "normalized",
    });

    expect(policy).not.toContain("\n");
    expect(policy).not.toMatch(/\s{2,}/);
  });
});

function getDirective(policy: string, directive: string) {
  return (
    policy
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(directive)) ?? ""
  );
}
