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

    const plans = await db.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar planos" },
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

    const data = await request.json();
    const { name, displayName, description, monthlyPrice, yearlyPrice, emailAccounts, storagePerAccount, features, sortOrder } = data;

    // Check if plan name already exists
    const existingPlan = await db.plan.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: "Já existe um plano com este nome" },
        { status: 400 }
      );
    }

    // Create plan
    const plan = await db.plan.create({
      data: {
        name: name.toLowerCase(),
        displayName,
        description,
        monthlyPrice: parseFloat(monthlyPrice),
        yearlyPrice: parseFloat(yearlyPrice),
        emailAccounts: parseInt(emailAccounts),
        storagePerAccount: parseInt(storagePerAccount),
        features: JSON.stringify(features || []),
        sortOrder: parseInt(sortOrder) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: "Erro ao criar plano" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID do plano é obrigatório" }, { status: 400 });
    }

    // Prepare update data
    const planData: any = {};
    if (updateData.displayName) planData.displayName = updateData.displayName;
    if (updateData.description !== undefined) planData.description = updateData.description;
    if (updateData.monthlyPrice) planData.monthlyPrice = parseFloat(updateData.monthlyPrice);
    if (updateData.yearlyPrice) planData.yearlyPrice = parseFloat(updateData.yearlyPrice);
    if (updateData.emailAccounts !== undefined) planData.emailAccounts = parseInt(updateData.emailAccounts);
    if (updateData.storagePerAccount !== undefined) planData.storagePerAccount = parseInt(updateData.storagePerAccount);
    if (updateData.features) planData.features = JSON.stringify(updateData.features);
    if (updateData.sortOrder !== undefined) planData.sortOrder = parseInt(updateData.sortOrder);
    if (updateData.isActive !== undefined) planData.isActive = updateData.isActive;

    // Update plan
    const plan = await db.plan.update({
      where: { id },
      data: planData,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar plano" },
      { status: 500 }
    );
  }
}
