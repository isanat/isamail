import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const partnerId = searchParams.get("partnerId") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (status) {
      where.subscription = { status };
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          subscription: true,
          partner: true,
          _count: {
            select: {
              domains: true,
              emailAccounts: true,
              invoices: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar clientes" },
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
    const { name, email, password, phone, partnerId, plan, billingCycle } = data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with subscription
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        partnerId: partnerId || null,
        subscription: {
          create: {
            plan: plan || "basic",
            billingCycle: billingCycle || "monthly",
            status: "trial",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          },
        },
      },
      include: {
        subscription: true,
        partner: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
