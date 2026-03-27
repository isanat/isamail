import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check auth
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await db.adminUser.findUnique({
      where: { id: sessionId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const settings = await db.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar configurações" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await db.adminUser.findUnique({
      where: { id: sessionId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const { settings } = await request.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Update or create each setting
    for (const setting of settings) {
      await db.systemSetting.upsert({
        where: { key: setting.key },
        create: {
          key: setting.key,
          value: setting.value,
        },
        update: {
          value: setting.value,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
