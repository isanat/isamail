import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { id } = await params;

    // Check if domain belongs to user
    const domain = await db.domain.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio não encontrado' },
        { status: 404 }
      );
    }

    // In a real implementation, we would check DNS records here
    // For now, we'll simulate a DNS check

    // TODO: Implement actual DNS checking
    // - Check MX record points to mail.isamail.space
    // - Check SPF record
    // - Check DKIM record
    // - Check DMARC record

    const mxVerified = false; // Would be checked via DNS lookup
    const spfVerified = false;
    const dkimVerified = false;
    const dmarcVerified = false;

    const allVerified = mxVerified && spfVerified && dkimVerified && dmarcVerified;

    // Update domain verification status
    await db.domain.update({
      where: { id },
      data: {
        mxVerified,
        spfVerified,
        dkimVerified,
        dmarcVerified,
        isVerified: allVerified,
        lastDnsCheck: new Date(),
      },
    });

    return NextResponse.json({
      verified: allVerified,
      checks: {
        mx: mxVerified,
        spf: spfVerified,
        dkim: dkimVerified,
        dmarc: dmarcVerified,
      },
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar domínio' },
      { status: 500 }
    );
  }
}
