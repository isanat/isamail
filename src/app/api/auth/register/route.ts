import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, plan, domainOption, domain } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user with subscription
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        subscription: {
          create: {
            plan: plan || "basic",
            billingCycle: "monthly",
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    // Create domain if custom domain is provided
    if (domainOption === "custom" && domain) {
      await db.domain.create({
        data: {
          userId: user.id,
          domain,
          isVerified: false,
          isIsamailSubdomain: false,
        },
      });
    }

    // Return success without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: "Conta criada com sucesso",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
