import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// This endpoint creates the initial admin user and seed data
// Should be disabled in production or protected
export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await db.adminUser.findFirst();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin já existe. Use o endpoint de login." },
        { status: 400 }
      );
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("IsaMail@Admin2026", 10);
    
    const admin = await db.adminUser.create({
      data: {
        email: "admin@isamail.space",
        name: "Administrador",
        password: hashedPassword,
        role: "super_admin",
      },
    });

    // Create default plans
    const plans = [
      {
        name: "basic",
        displayName: "Basic",
        description: "Perfeito para profissionais autônomos",
        monthlyPrice: 29,
        yearlyPrice: 289,
        emailAccounts: 1,
        storagePerAccount: 5,
        features: JSON.stringify([
          "1 conta de email",
          "5GB de armazenamento",
          "Domínio personalizado",
          "Anti-spam incluído",
          "Suporte por email",
        ]),
        sortOrder: 1,
      },
      {
        name: "standard",
        displayName: "Standard",
        description: "Ideal para pequenas empresas",
        monthlyPrice: 79,
        yearlyPrice: 789,
        emailAccounts: 5,
        storagePerAccount: 15,
        features: JSON.stringify([
          "5 contas de email",
          "15GB por conta",
          "Domínio personalizado",
          "Anti-spam avançado",
          "Suporte prioritário",
          "Relatórios de uso",
        ]),
        sortOrder: 2,
      },
      {
        name: "premium",
        displayName: "Premium",
        description: "Para equipes em crescimento",
        monthlyPrice: 199,
        yearlyPrice: 1990,
        emailAccounts: 20,
        storagePerAccount: 30,
        features: JSON.stringify([
          "20 contas de email",
          "30GB por conta",
          "Domínio personalizado",
          "Anti-spam premium",
          "Suporte 24/7",
          "API de integração",
          "Backup automático",
        ]),
        sortOrder: 3,
      },
      {
        name: "enterprise",
        displayName: "Enterprise",
        description: "Solução empresarial completa",
        monthlyPrice: 499,
        yearlyPrice: 4990,
        emailAccounts: -1, // unlimited
        storagePerAccount: -1, // unlimited
        features: JSON.stringify([
          "Contas ilimitadas",
          "Armazenamento ilimitado",
          "Domínios múltiplos",
          "SLA garantido",
          "Suporte dedicado",
          "API completa",
          "Integração AD/LDAP",
          "Auditoria e logs",
        ]),
        sortOrder: 4,
      },
    ];

    for (const plan of plans) {
      await db.plan.create({ data: plan });
    }

    // Create system settings
    await db.systemSetting.createMany({
      data: [
        { key: "site_name", value: "IsaMail", description: "Nome do site" },
        { key: "site_url", value: "https://isamail.space", description: "URL do site" },
        { key: "support_email", value: "suporte@isamail.space", description: "Email de suporte" },
        { key: "trial_days", value: "14", description: "Dias de trial gratuito" },
        { key: "currency", value: "BRL", description: "Moeda padrão" },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "Sistema inicializado com sucesso!",
      admin: {
        email: admin.email,
        password: "IsaMail@Admin2026",
      },
      plans: plans.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erro ao inicializar sistema" },
      { status: 500 }
    );
  }
}
