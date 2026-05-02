import { afterEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn(() => ({ storage: {} })));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

const originalEnv = { ...process.env };

describe("getSupabaseAdminClient", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it("cria client com SUPABASE_URL e service role sem persistir sessao", async () => {
    process.env.SUPABASE_URL = "https://server.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const { getSupabaseAdminClient } = await import("../supabase-admin");

    expect(getSupabaseAdminClient()).toEqual({ storage: {} });
    expect(createClientMock).toHaveBeenCalledWith(
      "https://server.supabase.co",
      "service-role",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  });

  it("usa NEXT_PUBLIC_SUPABASE_URL como fallback server-side", async () => {
    delete process.env.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const { getSupabaseAdminClient } = await import("../supabase-admin");

    getSupabaseAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://public.supabase.co",
      "service-role",
      expect.any(Object),
    );
  });

  it("reutiliza o client criado", async () => {
    process.env.SUPABASE_URL = "https://server.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const { getSupabaseAdminClient } = await import("../supabase-admin");

    expect(getSupabaseAdminClient()).toBe(getSupabaseAdminClient());
    expect(createClientMock).toHaveBeenCalledTimes(1);
  });

  it("falha quando envs obrigatorias nao estao configuradas", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { getSupabaseAdminClient } = await import("../supabase-admin");

    expect(() => getSupabaseAdminClient()).toThrow(
      "SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias",
    );
  });
});
