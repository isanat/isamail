import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const planLimits: Record<string, { accounts: number; storage: number }> = {
  basic: { accounts: 1, storage: 5 * 1024 * 1024 * 1024 }, // 5GB
  standard: { accounts: 5, storage: 15 * 1024 * 1024 * 1024 }, // 15GB per account
  premium: { accounts: 20, storage: 30 * 1024 * 1024 * 1024 }, // 30GB per account
  enterprise: { accounts: -1, storage: -1 }, // Unlimited
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Get user with subscription and domains
    const user = await db.user.findUnique({
      where: { id: sessionId },
      include: {
        subscription: true,
        domains: true,
        emailAccounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const plan = user.subscription?.plan || "basic";
    const limits = planLimits[plan];

    // Calculate total storage used
    const totalStorageUsed = user.emailAccounts.reduce(
      (sum, account) => sum + account.quotaUsed,
      0
    );

    // Calculate total storage limit
    const totalStorageLimit = limits.storage === -1 
      ? -1 
      : limits.storage * (limits.accounts === -1 ? user.emailAccounts.length || 1 : limits.accounts);

    // Mock stats (in production, these would come from actual email server logs)
    const stats = {
      emailsSent: Math.floor(Math.random() * 500) + 100,
      emailsReceived: Math.floor(Math.random() * 800) + 200,
      storageUsed: totalStorageUsed || Math.floor(Math.random() * 1000000000) + 100000000,
      storageLimit: totalStorageLimit,
      emailAccounts: user.emailAccounts.length,
      accountsLimit: limits.accounts,
    };

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      stats,
      domains: user.domains,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}
