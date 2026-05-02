import type { Prisma } from "@prisma/client";

export interface AccountDeletionInput {
  userId: string;
  previousEmail: string;
}

type AccountDeletionTx = Pick<
  Prisma.TransactionClient,
  "account" | "session" | "notification" | "verificationToken" | "order" | "user"
>;

export function buildDeletedAccountEmail(userId: string): string {
  return `deleted-${userId}@deleted.local`;
}

export function buildDeletedUserData(userId: string): Prisma.UserUpdateInput {
  return {
    name: "Conta excluida",
    email: buildDeletedAccountEmail(userId),
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
  };
}

export function buildDeletedOrderData(userId: string): Prisma.OrderUpdateManyMutationInput {
  return {
    customerName: "Cliente removido",
    customerEmail: buildDeletedAccountEmail(userId),
    customerPhone: "REMOVIDO",
    customerDocNumber: null,
    addressLine1: "Endereco removido",
    addressLine2: null,
    city: "Removido",
    state: "NA",
    postalCode: "00000000",
    notes: null,
  };
}

export async function anonymizeAccountForDeletion(
  tx: AccountDeletionTx,
  input: AccountDeletionInput,
): Promise<void> {
  await tx.account.deleteMany({
    where: { userId: input.userId },
  });

  await tx.session.deleteMany({
    where: { userId: input.userId },
  });

  await tx.notification.deleteMany({
    where: { userId: input.userId },
  });

  await tx.verificationToken.deleteMany({
    where: { identifier: input.previousEmail },
  });

  await tx.order.updateMany({
    where: { userId: input.userId },
    data: buildDeletedOrderData(input.userId),
  });

  await tx.user.update({
    where: { id: input.userId },
    data: buildDeletedUserData(input.userId),
    select: { id: true },
  });
}
