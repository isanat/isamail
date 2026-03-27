import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';

// MercadoPago configuration
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || '';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'isamail-' + Date.now(),
  },
});

// Plan prices in BRL (cents)
export const PLAN_PRICES = {
  basic: {
    monthly: 2900, // R$ 29.00
    yearly: 28900, // R$ 289.00 (17% discount)
  },
  standard: {
    monthly: 7900, // R$ 79.00
    yearly: 78900, // R$ 789.00 (17% discount)
  },
  premium: {
    monthly: 19900, // R$ 199.00
    yearly: 198900, // R$ 1989.00 (17% discount)
  },
  enterprise: {
    monthly: 49900, // R$ 499.00
    yearly: 498900, // R$ 4989.00 (17% discount)
  },
} as const;

export const PLAN_NAMES = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  enterprise: 'Enterprise',
} as const;

export const PLAN_LIMITS = {
  basic: { accounts: 1, storage: 5 * 1024 * 1024 * 1024 }, // 5GB
  standard: { accounts: 5, storage: 15 * 1024 * 1024 * 1024 }, // 15GB each
  premium: { accounts: 20, storage: 30 * 1024 * 1024 * 1024 }, // 30GB each
  enterprise: { accounts: -1, storage: -1 }, // Unlimited
} as const;

export interface CreatePreferenceParams {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  userName: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

// Create a payment preference
export async function createPaymentPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
  const { planId, billingCycle, userId, userEmail, userName } = params;
  
  const price = PLAN_PRICES[planId as keyof typeof PLAN_PRICES]?.[billingCycle] || 0;
  const planName = PLAN_NAMES[planId as keyof typeof PLAN_NAMES] || planId;
  
  const preference = new Preference(client);
  
  const result = await preference.create({
    body: {
      items: [
        {
          id: `${planId}-${billingCycle}`,
          title: `IsaMail - Plano ${planName} (${billingCycle === 'monthly' ? 'Mensal' : 'Anual'})`,
          description: `Assinatura do plano ${planName} - Email Profissional`,
          category_id: 'services',
          quantity: 1,
          unit_price: price / 100, // Convert cents to reais
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: userName.split(' ')[0] || '',
        surname: userName.split(' ').slice(1).join(' ') || '',
        email: userEmail,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`,
      external_reference: userId,
      metadata: {
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      statement_descriptor: 'ISAMAIL',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    },
  });

  return {
    id: result.id!,
    init_point: result.init_point!,
    sandbox_init_point: result.sandbox_init_point!,
  };
}

// Get payment status
export async function getPaymentStatus(paymentId: string) {
  const payment = new Payment(client);
  
  const result = await payment.get({
    id: paymentId,
  });

  return {
    id: result.id,
    status: result.status,
    status_detail: result.status_detail,
    external_reference: result.external_reference,
    transaction_amount: result.transaction_amount,
    currency_id: result.currency_id,
    date_created: result.date_created,
    date_approved: result.date_approved,
    payment_method_id: result.payment_method_id,
    payment_type_id: result.payment_type_id,
    metadata: result.metadata,
  };
}

// Get public key for frontend
export function getPublicKey(): string {
  return publicKey;
}

// Check if MercadoPago is configured
export function isMercadoPagoConfigured(): boolean {
  return Boolean(accessToken && publicKey);
}
