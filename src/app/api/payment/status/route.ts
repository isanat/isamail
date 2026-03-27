import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, isMercadoPagoConfigured } from '@/lib/mercadopago';

export async function GET(request: NextRequest) {
  try {
    // Check if MercadoPago is configured
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'MercadoPago não está configurado' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      );
    }

    const payment = await getPaymentStatus(paymentId);

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      dateCreated: payment.date_created,
      dateApproved: payment.date_approved,
      paymentMethod: payment.payment_method_id,
      paymentType: payment.payment_type_id,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Erro ao obter status do pagamento' },
      { status: 500 }
    );
  }
}
