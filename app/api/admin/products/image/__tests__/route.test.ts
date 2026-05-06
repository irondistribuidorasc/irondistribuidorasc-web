import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/lib/csrf", () => ({
  validateCsrfOrigin: vi.fn(() => null),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const upload = vi.hoisted(() => vi.fn());
const getPublicUrl = vi.hoisted(() => vi.fn());
const getSupabaseAdminClient = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/supabase-admin", () => ({
  getSupabaseAdminClient,
}));

import { auth } from "@/src/lib/auth";
import { validateCsrfOrigin } from "@/src/lib/csrf";
import { POST } from "../route";

class TestFile {
  readonly size: number;
  readonly type: string;
  readonly name: string;
  private readonly bytes: Uint8Array;

  constructor(
    parts: Array<Uint8Array | number[] | string>,
    name: string,
    options?: { type?: string },
  ) {
    this.name = name;
    this.type = options?.type ?? "";

    const chunks = parts.map((part) =>
      typeof part === "string" ? new TextEncoder().encode(part) : new Uint8Array(part),
    );
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const bytes = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    this.bytes = bytes;
    this.size = bytes.length;
  }

  async arrayBuffer() {
    return this.bytes.slice().buffer;
  }
}

vi.stubGlobal("File", TestFile as never);

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    approved: true,
  },
};

function createUploadRequest(file: File, origin = "http://localhost:3001") {
  return {
    headers: new Headers({
      Origin: origin,
    }),
    formData: async () => ({
      get: (key: string) => (key === "file" ? file : null),
    }),
  };
}

describe("app/api/admin/products/image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upload.mockReset();
    getPublicUrl.mockReset();
    getSupabaseAdminClient.mockReset();
    vi.mocked(validateCsrfOrigin).mockReturnValue(null);
    getSupabaseAdminClient.mockReturnValue({
      storage: {
        from: vi.fn(() => ({
          upload,
          getPublicUrl,
        })),
      },
    });
  });

  it("bloqueia requisição sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "test.png", {
      type: "image/png",
    });

    const response = await POST(createUploadRequest(file) as never);

    expect(response.status).toBe(403);
  });

  it("bloqueia requisição com CSRF inválido", async () => {
    vi.mocked(validateCsrfOrigin).mockReturnValueOnce(
      NextResponse.json({ error: "Origin não permitido" }, { status: 403 }),
    );
    vi.mocked(auth).mockResolvedValue(adminSession as never);

    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "test.png", {
      type: "image/png",
    });

    const response = await POST(createUploadRequest(file, "http://malicious.example") as never);

    expect(response.status).toBe(403);
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejeita tipo de imagem inválido", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);

    const file = new File([new Uint8Array([0x47, 0x49, 0x46, 0x38])], "test.gif", {
      type: "image/gif",
    });

    const response = await POST(createUploadRequest(file) as never);

    expect(response.status).toBe(400);
  });

  it("faz upload da imagem e retorna URL pública", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/products/test.png" },
    });

    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00])],
      "test.png",
      { type: "image/png" },
    );

    const response = await POST(createUploadRequest(file) as never);

    expect(response.status).toBe(200);
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^products\/[a-f0-9-]+\.png$/),
      expect.any(File),
      expect.objectContaining({
        contentType: "image/png",
        upsert: false,
      }),
    );
    const payload = await response.json();
    expect(payload.url).toContain("/products/");
    expect(payload.path).toMatch(/^products\/[a-f0-9-]+\.png$/);
  });
});
