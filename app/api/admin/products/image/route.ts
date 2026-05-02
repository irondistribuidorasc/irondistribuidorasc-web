import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import {
  buildProductImagePath,
  PRODUCT_IMAGE_BUCKET,
  validateProductImageUpload,
} from "@/src/lib/product-image-upload";
import { getSupabaseAdminClient } from "@/src/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo de imagem é obrigatório" },
        { status: 400 },
      );
    }

    const validation = validateProductImageUpload({
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const filePath = buildProductImagePath(file.type);
    const supabase = getSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error("admin/products/image:POST - Erro no upload Supabase", {
        error: uploadError.message,
      });
      return NextResponse.json(
        { error: "Erro ao enviar imagem" },
        { status: 500 },
      );
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: data.publicUrl, path: filePath });
  } catch (error) {
    logger.error("admin/products/image:POST - Erro ao enviar imagem", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao enviar imagem" },
      { status: 500 },
    );
  }
}
