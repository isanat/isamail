import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: sessionId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      invoices: user.invoices.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        plan: invoice.plan,
        billingCycle: invoice.billingCycle,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        mercadoPagoId: invoice.mercadoPagoId,
        invoiceUrl: invoice.invoiceUrl,
        pdfUrl: invoice.pdfUrl,
        createdAt: invoice.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar faturas' },
      { status: 500 }
    );
  }
}
