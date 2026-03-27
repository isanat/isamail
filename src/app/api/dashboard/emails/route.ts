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
        subscription: true,
        domains: {
          where: { isVerified: true },
          select: { id: true, domain: true, isVerified: true },
        },
        emailAccounts: {
          include: {
            domain: {
              select: { id: true, domain: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      emailAccounts: user.emailAccounts.map((account) => ({
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        quotaUsed: account.quotaUsed,
        quotaLimit: account.quotaLimit,
        isActive: account.isActive,
        mailuSynced: account.mailuSynced,
        createdAt: account.createdAt,
        domain: account.domain,
      })),
      domains: user.domains,
    });
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar contas de email' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { localPart, domainId, password } = body;

    if (!localPart || !domainId || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Get domain
    const domain = await db.domain.findFirst({
      where: {
        id: domainId,
        userId: sessionId,
        isVerified: true,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio não encontrado ou não verificado' },
        { status: 400 }
      );
    }

    const email = `${localPart.toLowerCase()}@${domain.domain}`;

    // Check if email already exists
    const existing = await db.emailAccount.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este email já existe' },
        { status: 400 }
      );
    }

    // Check account limits
    const user = await db.user.findUnique({
      where: { id: sessionId },
      include: {
        subscription: true,
        _count: { select: { emailAccounts: true } },
      },
    });

    const planLimits: Record<string, number> = {
      basic: 1,
      standard: 5,
      premium: 20,
      enterprise: -1,
    };

    const limit = planLimits[user?.subscription?.plan || 'basic'];
    if (limit !== -1 && (user?._count.emailAccounts || 0) >= limit) {
      return NextResponse.json(
        { error: 'Limite de contas do seu plano atingido' },
        { status: 400 }
      );
    }

    // Create email account
    const emailAccount = await db.emailAccount.create({
      data: {
        userId: sessionId,
        domainId: domain.id,
        email,
        password,
        displayName: localPart,
        quotaLimit: 15 * 1024 * 1024 * 1024, // 15GB default
      },
    });

    // TODO: Sync with Mailu API

    return NextResponse.json({
      id: emailAccount.id,
      email: emailAccount.email,
      message: 'Conta de email criada com sucesso',
    });
  } catch (error) {
    console.error('Error creating email account:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta de email' },
      { status: 500 }
    );
  }
}
