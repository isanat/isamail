import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

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

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [partners, total] = await Promise.all([
      db.partner.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.partner.count({ where }),
    ]);

    // Calculate total customers for each partner
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const activeCustomers = await db.user.count({
          where: {
            partnerId: partner.id,
            subscription: { status: "active" },
          },
        });

        const revenue = await db.invoice.aggregate({
          where: {
            user: { partnerId: partner.id },
            status: "paid",
            paidAt: {
              gte: new Date(new Date().setDate(1)),
            },
          },
          _sum: { amount: true },
        });

        return {
          ...partner,
          activeCustomers,
          monthlyRevenue: revenue._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      partners: partnersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get partners error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar parceiros" },
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
    const { name, email, phone, companyDoc, contactName, commission, notes, customDomain } = data;

    // Check if email already exists
    const existingPartner = await db.partner.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Create partner
    const partner = await db.partner.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        companyDoc,
        contactName,
        commission: parseFloat(commission) || 10,
        notes,
        customDomain,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error("Create partner error:", error);
    return NextResponse.json(
      { error: "Erro ao criar parceiro" },
      { status: 500 }
    );
  }
}
