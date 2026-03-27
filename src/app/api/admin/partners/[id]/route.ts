import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const data = await request.json();

    const partner = await db.partner.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error("Update partner error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar parceiro" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await db.partner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete partner error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir parceiro" },
      { status: 500 }
    );
  }
}
