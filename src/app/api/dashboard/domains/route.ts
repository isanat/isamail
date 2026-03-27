import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        domains: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { emailAccounts: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      domains: user.domains.map((domain) => ({
        id: domain.id,
        domain: domain.domain,
        isVerified: domain.isVerified,
        isIsamailSubdomain: domain.isIsamailSubdomain,
        dkimVerified: domain.dkimVerified,
        spfVerified: domain.spfVerified,
        dmarcVerified: domain.dmarcVerified,
        mxVerified: domain.mxVerified,
        dkimPublicKey: domain.dkimPublicKey,
        lastDnsCheck: domain.lastDnsCheck,
        createdAt: domain.createdAt,
        _count: domain._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar domínios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio é obrigatório' },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existing = await db.domain.findUnique({
      where: { domain },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este domínio já está cadastrado' },
        { status: 400 }
      );
    }

    // Check if it's an isamail.space subdomain
    const isIsamailSubdomain = domain.endsWith('.isamail.space');

    // Create domain
    const newDomain = await db.domain.create({
      data: {
        userId: session.userId,
        domain,
        isIsamailSubdomain,
        isVerified: isIsamailSubdomain, // Auto-verify isamail subdomains
      },
    });

    // TODO: Create domain in Mailu and generate DKIM

    return NextResponse.json({
      id: newDomain.id,
      domain: newDomain.domain,
      message: 'Domínio adicionado com sucesso',
    });
  } catch (error) {
    console.error('Error creating domain:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar domínio' },
      { status: 500 }
    );
  }
}
