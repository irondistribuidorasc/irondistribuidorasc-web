import { describe, expect, it, vi } from "vitest";

import {
  anonymizeAccountForDeletion,
  buildDeletedAccountEmail,
  buildDeletedOrderData,
  buildDeletedUserData,
} from "../account-deletion";

describe("account deletion anonymization", () => {
  it("gera email anonimo estavel para liberar o email original", () => {
    expect(buildDeletedAccountEmail("user_123")).toBe(
      "deleted-user_123@deleted.local",
    );
  });

  it("monta payload anonimo do usuario sem credenciais nem dados pessoais", () => {
    expect(buildDeletedUserData("user_123")).toEqual({
      name: "Conta excluida",
      email: "deleted-user_123@deleted.local",
      emailVerified: null,
      image: null,
      hashedPassword: null,
      phone: null,
      docNumber: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      postalCode: null,
      storeName: null,
      storePhone: null,
      tradeLicense: null,
      role: "USER",
      approved: false,
    });
  });

  it("monta payload anonimo para snapshots pessoais dos pedidos", () => {
    expect(buildDeletedOrderData("user_123")).toEqual({
      customerName: "Cliente removido",
      customerEmail: "deleted-user_123@deleted.local",
      customerPhone: "REMOVIDO",
      customerDocNumber: null,
      addressLine1: "Endereco removido",
      addressLine2: null,
      city: "Removido",
      state: "NA",
      postalCode: "00000000",
      notes: null,
    });
  });

  it("anonimiza em transacao sem deletar usuario, pedidos, itens ou feedbacks", async () => {
    const tx = {
      account: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      session: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      notification: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
      verificationToken: { deleteMany: vi.fn().mockResolvedValue({ count: 4 }) },
      order: { updateMany: vi.fn().mockResolvedValue({ count: 5 }) },
      user: {
        update: vi.fn().mockResolvedValue({ id: "user_123" }),
        delete: vi.fn(),
      },
    };

    await anonymizeAccountForDeletion(tx, {
      userId: "user_123",
      previousEmail: "cliente@example.com",
    });

    expect(tx.account.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
    });
    expect(tx.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
    });
    expect(tx.notification.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
    });
    expect(tx.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "cliente@example.com" },
    });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      data: buildDeletedOrderData("user_123"),
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: buildDeletedUserData("user_123"),
      select: { id: true },
    });
    expect(tx.user.delete).not.toHaveBeenCalled();
  });
});
