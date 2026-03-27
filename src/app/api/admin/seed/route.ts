import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// This endpoint creates the initial admin user and seed data
// Supports both GET and POST for easy browser access

async function seedDatabase() {
  // Check if admin already exists
  const existingAdmin = await db.adminUser.findFirst();

  if (existingAdmin) {
    return {
      success: false,
      error: "Admin já existe. Use o endpoint de login.",
      admin: {
        email: existingAdmin.email,
      },
    };
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
  for (const setting of [
    { key: "site_name", value: "IsaMail", description: "Nome do site" },
    { key: "site_url", value: "https://isamail.space", description: "URL do site" },
    { key: "support_email", value: "suporte@isamail.space", description: "Email de suporte" },
    { key: "trial_days", value: "14", description: "Dias de trial gratuito" },
    { key: "currency", value: "BRL", description: "Moeda padrão" },
  ]) {
    await db.systemSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }

  return {
    success: true,
    message: "Sistema inicializado com sucesso!",
    admin: {
      email: admin.email,
      password: "IsaMail@Admin2026",
    },
    plansCount: plans.length,
  };
}

export async function GET() {
  try {
    const result = await seedDatabase();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erro ao inicializar sistema", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erro ao inicializar sistema", details: String(error) },
      { status: 500 }
    );
  }
}
