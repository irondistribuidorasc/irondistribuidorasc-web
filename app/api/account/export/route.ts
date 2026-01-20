import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { NextResponse } from "next/server";

/**
 * GET /api/account/export
 * Exporta todos os dados do usuário em formato JSON (LGPD Art. 18 - Portabilidade)
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Rate limiting para ações sensíveis
    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "sensitiveAction");
    if (rateLimitResponse) {
      logger.warn("account/export - Rate limit excedido", {
        userId: session.user.id,
        ip: clientIP,
      });
      return rateLimitResponse;
    }

    // Buscar todos os dados do usuário
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        phone: true,
        docNumber: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        storeName: true,
        storePhone: true,
        tradeLicense: true,
        role: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
        // Não incluir hashedPassword por segurança
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            paymentMethod: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            customerDocNumber: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                id: true,
                productCode: true,
                productName: true,
                quantity: true,
                price: true,
                total: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        notifications: {
          select: {
            id: true,
            title: true,
            message: true,
            read: true,
            link: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    logger.info("account/export - Dados exportados", {
      userId: user.id,
    });

    // Formatar dados para exportação
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
      dataController: {
        name: "IRON DISTRIBUIDORA SC",
        contact: "contato@irondistribuidorasc.com.br",
      },
      userData: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          phone: user.phone,
          docNumber: user.docNumber,
          role: user.role,
          approved: user.approved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        address: {
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
        },
        businessInfo: {
          storeName: user.storeName,
          storePhone: user.storePhone,
          tradeLicense: user.tradeLicense,
        },
        orders: user.orders,
        notifications: user.notifications,
      },
      legalBasis: {
        description: "Dados coletados com base no consentimento e execução de contrato (LGPD Art. 7, I e V)",
        retentionPeriod: "Dados mantidos enquanto a conta estiver ativa ou conforme obrigações legais",
      },
    };

    // Retornar como download JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="meus-dados-iron-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    logger.error("account/export - Erro ao exportar dados", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao exportar dados. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

