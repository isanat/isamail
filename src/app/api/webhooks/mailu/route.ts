import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook for debugging
    await db.mailuWebhook.create({
      data: {
        eventType: body.type || body.event || 'unknown',
        payload: JSON.stringify(body),
        processed: false,
      },
    });

    // Process different webhook types
    const eventType = body.type || body.event;
    
    switch (eventType) {
      case 'user_created':
        await handleUserCreated(body);
        break;
      case 'user_deleted':
        await handleUserDeleted(body);
        break;
      case 'domain_created':
        await handleDomainCreated(body);
        break;
      case 'domain_deleted':
        await handleDomainDeleted(body);
        break;
      default:
        console.log('Unknown Mailu webhook event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mailu webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(data: Record<string, unknown>) {
  const email = data.email as string;
  if (!email) return;

  // Update email account sync status
  await db.emailAccount.updateMany({
    where: { email },
    data: {
      mailuSynced: true,
      lastSyncAt: new Date(),
      mailuSyncError: null,
    },
  });

  // Mark webhook as processed
  await db.mailuWebhook.updateMany({
    where: { payload: { contains: email } },
    data: { processed: true, processedAt: new Date() },
  });
}

async function handleUserDeleted(data: Record<string, unknown>) {
  const email = data.email as string;
  if (!email) return;

  // Update email account status
  await db.emailAccount.updateMany({
    where: { email },
    data: {
      isActive: false,
      mailuSynced: false,
      lastSyncAt: new Date(),
    },
  });

  // Mark webhook as processed
  await db.mailuWebhook.updateMany({
    where: { payload: { contains: email } },
    data: { processed: true, processedAt: new Date() },
  });
}

async function handleDomainCreated(data: Record<string, unknown>) {
  const domain = data.domain as string;
  if (!domain) return;

  // Update domain sync status
  await db.domain.updateMany({
    where: { domain },
    data: {
      mailuSynced: true,
      mailuSyncError: null,
    },
  });

  // Mark webhook as processed
  await db.mailuWebhook.updateMany({
    where: { payload: { contains: domain } },
    data: { processed: true, processedAt: new Date() },
  });
}

async function handleDomainDeleted(data: Record<string, unknown>) {
  const domain = data.domain as string;
  if (!domain) return;

  // Update domain status
  await db.domain.updateMany({
    where: { domain },
    data: {
      mailuSynced: false,
      isVerified: false,
    },
  });

  // Mark webhook as processed
  await db.mailuWebhook.updateMany({
    where: { payload: { contains: domain } },
    data: { processed: true, processedAt: new Date() },
  });
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'mailu-webhook' });
}
