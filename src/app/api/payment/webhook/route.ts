import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // MercadoPago webhook data
    const { type, data } = body;
    
    // Only process payment notifications
    if (type !== 'payment') {
      return NextResponse.json({ received: true, message: 'Notification type ignored' });
    }

    const paymentId = data?.id;
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID not provided' },
        { status: 400 }
      );
    }

    // Get payment details from MercadoPago
    const payment = await getPaymentStatus(paymentId.toString());
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const userId = payment.external_reference || payment.metadata?.user_id;
    const planId = payment.metadata?.plan_id;
    const billingCycle = payment.metadata?.billing_cycle;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in payment' },
        { status: 400 }
      );
    }

    // Update or create invoice
    const invoice = await db.invoice.upsert({
      where: {
        id: `MP-${paymentId}`,
      },
      create: {
        id: `MP-${paymentId}`,
        userId,
        amount: payment.transaction_amount || 0,
        currency: payment.currency_id || 'BRL',
        status: mapPaymentStatus(payment.status),
        plan: planId || 'basic',
        billingCycle: billingCycle || 'monthly',
        dueDate: new Date(),
        paidAt: payment.status === 'approved' ? new Date() : null,
      },
      update: {
        status: mapPaymentStatus(payment.status),
        paidAt: payment.status === 'approved' ? new Date() : null,
      },
    });

    // If payment is approved, update/create subscription
    if (payment.status === 'approved') {
      const now = new Date();
      const periodEnd = new Date(now);
      
      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: planId || 'basic',
          billingCycle: billingCycle || 'monthly',
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        update: {
          plan: planId || 'basic',
          billingCycle: billingCycle || 'monthly',
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return NextResponse.json({ 
      received: true, 
      paymentId,
      status: payment.status,
      invoiceId: invoice.id 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Map MercadoPago status to our internal status
function mapPaymentStatus(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return 'paid';
    case 'pending':
    case 'in_process':
    case 'in_mediation':
      return 'pending';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'cancelled';
    default:
      return 'pending';
  }
}

// GET endpoint for webhook verification (MercadoPago requires this)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');
  
  // MercadoPago verification
  if (topic && id) {
    return NextResponse.json({ received: true });
  }
  
  return NextResponse.json({ status: 'ok' });
}
