import { NextResponse } from "next/server";
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

    // Get stats
    const [
      totalCustomers,
      activeCustomers,
      totalPartners,
      activePartners,
      totalDomains,
      totalEmailAccounts,
      pendingInvoices,
      invoices,
      newCustomersThisMonth,
    ] = await Promise.all([
      // Total customers
      db.user.count(),
      // Active customers (with active subscription)
      db.user.count({
        where: {
          subscription: {
            status: "active",
          },
        },
      }),
      // Total partners
      db.partner.count(),
      // Active partners
      db.partner.count({
        where: { status: "active" },
      }),
      // Total domains
      db.domain.count(),
      // Total email accounts
      db.emailAccount.count(),
      // Pending invoices
      db.invoice.count({
        where: { status: "pending" },
      }),
      // Paid invoices for revenue calculation
      db.invoice.findMany({
        where: {
          status: "paid",
          paidAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
        select: { amount: true },
      }),
      // New customers this month
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Calculate growth (simplified - comparing with last month)
    const lastMonthUsers = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lt: new Date(new Date().setDate(1)),
        },
      },
    });

    const customersGrowth = lastMonthUsers > 0 
      ? Math.round(((newCustomersThisMonth - lastMonthUsers) / lastMonthUsers) * 100)
      : newCustomersThisMonth > 0 ? 100 : 0;

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      totalPartners,
      activePartners,
      totalDomains,
      totalEmailAccounts,
      monthlyRevenue,
      pendingInvoices,
      newCustomersThisMonth,
      customersGrowth,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar estatísticas" },
      { status: 500 }
    );
  }
}
