import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function DELETE(
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
      include: {
        _count: { select: { emailAccounts: true } },
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio não encontrado' },
        { status: 404 }
      );
    }

    // Check if there are email accounts
    if (domain._count.emailAccounts > 0) {
      return NextResponse.json(
        { error: 'Exclua todas as contas de email antes de excluir o domínio' },
        { status: 400 }
      );
    }

    // Delete domain
    await db.domain.delete({
      where: { id },
    });

    // TODO: Delete from Mailu

    return NextResponse.json({ message: 'Domínio excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir domínio' },
      { status: 500 }
    );
  }
}
