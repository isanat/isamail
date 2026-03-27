import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference, isMercadoPagoConfigured } from '@/lib/mercadopago';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check if MercadoPago is configured
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'MercadoPago não está configurado' },
        { status: 500 }
      );
    }

    // Get user from session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Plano e ciclo de cobrança são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate plan
    const validPlans = ['basic', 'standard', 'premium', 'enterprise'];
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    const validCycles = ['monthly', 'yearly'];
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Ciclo de cobrança inválido' },
        { status: 400 }
      );
    }

    // Create payment preference
    const preference = await createPaymentPreference({
      planId,
      billingCycle,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Erro ao criar preferência de pagamento' },
      { status: 500 }
    );
  }
}
