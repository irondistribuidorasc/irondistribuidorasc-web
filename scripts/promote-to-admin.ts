import { db } from "@/src/lib/prisma";

const USER_IDENTIFIER = process.argv[2];

if (!USER_IDENTIFIER) {
  console.error("❌ Uso: npx tsx scripts/promote-to-admin.ts <nome-ou-email>");
  console.error("   Exemplo: npx tsx scripts/promote-to-admin.ts admin@exemplo.com");
  process.exit(1);
}

async function promoteToAdmin() {
  console.log(`Buscando usuário: "${USER_IDENTIFIER}"...`);

  // Buscar usuário pelo nome ou email
  const user = await db.user.findFirst({
    where: {
      OR: [
        { name: { contains: USER_IDENTIFIER, mode: "insensitive" } },
        { email: { contains: USER_IDENTIFIER, mode: "insensitive" } },
      ],
    },
  });

  if (!user) {
    console.error(`❌ Usuário "${USER_IDENTIFIER}" não encontrado.`);
    console.log("\nUsuários disponíveis:");
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      take: 10,
    });
    users.forEach((u) =>
      console.log(`  - ${u.name} (${u.email}) [${u.role}]`)
    );
    return;
  }

  if (user.role === "ADMIN") {
    console.log(`✅ Usuário "${user.name}" já é ADMIN.`);
    return;
  }

  console.log(`Encontrado: ${user.name} (${user.email}) - Role atual: ${user.role}`);

  // Atualizar para ADMIN
  const updated = await db.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", approved: true },
  });

  console.log(`✅ Usuário "${updated.name}" promovido a ADMIN com sucesso!`);
}

promoteToAdmin()
  .catch((e) => console.error("Erro:", e))
  .finally(async () => {
    await db.$disconnect();
  });
